import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { MerchantAccountConfig, StoreSettings } from '../../types';

interface MerchantAccountTabProps {
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
}

export const MerchantAccountTab: React.FC<MerchantAccountTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const accounts: MerchantAccountConfig[] = settings.merchantAccounts || [
    {
      id: 'ma-1',
      gateway: 'bKash',
      username: 'duarishop_merchant',
      password: '••••••••',
      appKey: 'BK-KEY-449102',
      appSecret: 'BK-SEC-992104',
      active: true,
    },
  ];

  const [selectedGateway, setSelectedGateway] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [appKey, setAppKey] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    let updatedAccounts: MerchantAccountConfig[];
    if (editingId) {
      updatedAccounts = accounts.map((acc) =>
        acc.id === editingId
          ? {
              ...acc,
              gateway: selectedGateway,
              username: username.trim(),
              password: password || acc.password,
              appKey: appKey.trim() || acc.appKey,
              appSecret: appSecret.trim() || acc.appSecret,
            }
          : acc
      );
      setEditingId(null);
      showToast('মার্চেন্ট একাউন্ট সফলভাবে আপডেট হয়েছে!');
    } else {
      const newAcc: MerchantAccountConfig = {
        id: `ma-${Date.now()}`,
        gateway: selectedGateway,
        username: username.trim(),
        password: password || '••••••••',
        appKey: appKey.trim() || `KEY-${Date.now().toString().slice(-6)}`,
        appSecret: appSecret.trim() || `SEC-${Date.now().toString().slice(-6)}`,
        active: true,
      };
      updatedAccounts = [...accounts, newAcc];
      showToast('নতুন মার্চেন্ট একাউন্ট সেভ হয়েছে!');
    }

    onUpdateSettings({
      ...settings,
      merchantAccounts: updatedAccounts,
    });

    setUsername('');
    setPassword('');
    setAppKey('');
    setAppSecret('');
  };

  const handleEdit = (acc: MerchantAccountConfig) => {
    setEditingId(acc.id);
    setSelectedGateway(acc.gateway);
    setUsername(acc.username);
    setPassword(acc.password || '');
    setAppKey(acc.appKey);
    setAppSecret(acc.appSecret);
  };

  const handleDelete = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    onUpdateSettings({
      ...settings,
      merchantAccounts: updated,
    });
    showToast('মার্চেন্ট একাউন্ট ডিলিট করা হয়েছে!');
  };

  const handleToggleActive = (id: string) => {
    const updated = accounts.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    onUpdateSettings({
      ...settings,
      merchantAccounts: updated,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6 text-slate-800">
      {/* Header matching screenshot: 🖊️ মার্চেন্ট একাউন্ট */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
          <span className="text-blue-500">🖊️</span>
          <span>মার্চেন্ট একাউন্ট</span>
        </div>
        {toastMsg && (
          <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Form matching screenshot */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Row 1: সিলেক্ট গেটওয়ে* | Username* | Password* */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              সিলেক্ট গেটওয়ে*
            </label>
            <select
              value={selectedGateway}
              onChange={(e) =>
                setSelectedGateway(e.target.value as 'bKash' | 'Nagad' | 'Rocket')
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-800"
            >
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              Username*
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Merchant Username"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              Password*
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Row 2: App Key* */}
        <div className="text-xs">
          <label className="block text-slate-700 font-medium mb-1.5">
            App Key*
          </label>
          <input
            type="text"
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            placeholder="Merchant App Key"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
          />
        </div>

        {/* Row 3: App Secret* */}
        <div className="text-xs">
          <label className="block text-slate-700 font-medium mb-1.5">
            App Secret*
          </label>
          <input
            type="text"
            value={appSecret}
            onChange={(e) => setAppSecret(e.target.value)}
            placeholder="Merchant App Secret"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
          />
        </div>

        {/* Action Button: সেভ করুন */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#00d084] hover:bg-[#00b975] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {editingId ? 'আপডেট করুন' : 'সেভ করুন'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setUsername('');
                setPassword('');
                setAppKey('');
                setAppSecret('');
              }}
              className="px-3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
            >
              বাতিল
            </button>
          )}
        </div>
      </form>

      {/* Table matching screenshot: Gateway Name | UserName | Active | Edit */}
      <div className="pt-4 border-t border-slate-100 overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="py-2.5 px-4 border-r border-slate-200 w-1/3">
                Gateway Name
              </th>
              <th className="py-2.5 px-4 border-r border-slate-200 w-1/3">
                UserName
              </th>
              <th className="py-2.5 px-4 border-r border-slate-200 w-1/6 text-center">
                Active
              </th>
              <th className="py-2.5 px-4 text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  কোনো মার্চেন্ট একাউন্ট যুক্ত করা নেই
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200">
                    {acc.gateway}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 border-r border-slate-200 font-mono">
                    {acc.username}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-200 text-center">
                    <input
                      type="checkbox"
                      checked={acc.active}
                      onChange={() => handleToggleActive(acc.id)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 accent-[#00d084] cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(acc)}
                        title="Edit Account"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        title="Delete Account"
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
