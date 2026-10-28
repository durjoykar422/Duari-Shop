import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle2, RefreshCw, Truck } from 'lucide-react';
import { CourierConfig, StoreSettings } from '../../types';

interface ConnectCourierTabProps {
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
}

const AVAILABLE_COURIERS = [
  'Steadfast',
  'Pathao',
  'RedX',
  'Paperfly',
  'eCourier',
];

export const ConnectCourierTab: React.FC<ConnectCourierTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const couriers: CourierConfig[] = settings.couriers || [
    {
      id: 'cour-1',
      name: 'Steadfast',
      apiKey: 'SF-KEY-789214',
      secretKey: 'SF-SEC-99120',
      balance: 4500,
      isDefault: true,
      active: true,
    },
  ];

  const [selectedCourier, setSelectedCourier] = useState('Steadfast');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourier) return;

    let updatedCouriers: CourierConfig[];
    if (editingId) {
      updatedCouriers = couriers.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: selectedCourier,
              apiKey: apiKey || c.apiKey,
              secretKey: secretKey || c.secretKey,
            }
          : c
      );
      setEditingId(null);
      showToast('কুরিয়ার সফলভাবে আপডেট করা হয়েছে!');
    } else {
      const isFirst = couriers.length === 0;
      const newCourier: CourierConfig = {
        id: `cour-${Date.now()}`,
        name: selectedCourier,
        apiKey: apiKey.trim() || `API-${Date.now().toString().slice(-6)}`,
        secretKey: secretKey.trim() || `SEC-${Date.now().toString().slice(-6)}`,
        balance: 0,
        isDefault: isFirst,
        active: true,
      };
      updatedCouriers = [...couriers, newCourier];
      showToast('নতুন কুরিয়ার কানেক্ট ও সেভ হয়েছে!');
    }

    onUpdateSettings({
      ...settings,
      couriers: updatedCouriers,
    });

    setApiKey('');
    setSecretKey('');
  };

  const handleEdit = (c: CourierConfig) => {
    setEditingId(c.id);
    setSelectedCourier(c.name);
    setApiKey(c.apiKey);
    setSecretKey(c.secretKey);
  };

  const handleDelete = (id: string) => {
    const updated = couriers.filter((c) => c.id !== id);
    onUpdateSettings({
      ...settings,
      couriers: updated,
    });
    showToast('কুরিয়ার ডিলিট করা হয়েছে!');
  };

  const handleSetDefault = (id: string) => {
    const updated = couriers.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
    onUpdateSettings({
      ...settings,
      couriers: updated,
    });
    showToast('ডিফল্ট কুরিয়ার সেট করা হয়েছে!');
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6 text-slate-800">
      {/* Header matching screenshot: 🖊️ কানেক্ট কুরিয়ার */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
          <span className="text-blue-500">🖊️</span>
          <span>কানেক্ট কুরিয়ার</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* সিলেক্ট কুরিয়ার* */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              সিলেক্ট কুরিয়ার*
            </label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-800"
            >
              {AVAILABLE_COURIERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* API-Key/Client ID* */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              API-Key/Client ID*
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key or Client ID"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>

          {/* Secret-Key/Client Secret* */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              Secret-Key/Client Secret*
            </label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Secret Key or Client Secret"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Action Button: কানেক্ট এন্ড সেভ */}
        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#00d084] hover:bg-[#00b975] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {editingId ? 'আপডেট এন্ড সেভ' : 'কানেক্ট এন্ড সেভ'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setApiKey('');
                setSecretKey('');
              }}
              className="ml-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
            >
              বাতিল
            </button>
          )}
        </div>
      </form>

      {/* Table matching screenshot: Courier_Name | Balance | Default | Action */}
      <div className="pt-4 border-t border-slate-100 overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="py-2.5 px-4 border-r border-slate-200">Courier_Name</th>
              <th className="py-2.5 px-4 border-r border-slate-200">Balance</th>
              <th className="py-2.5 px-4 border-r border-slate-200">Default</th>
              <th className="py-2.5 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {couriers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  কোনো কুরিয়ার কানেক্ট করা নেই
                </td>
              </tr>
            ) : (
              couriers.map((c) => (
                <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 border-r border-slate-200">
                    ৳ {c.balance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-r border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(c.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                        c.isDefault
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c.isDefault ? '✓ Default' : 'Set Default'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        title="Edit"
                        className="p-1 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete"
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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
