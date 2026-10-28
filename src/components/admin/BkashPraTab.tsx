import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { BkashPraAccountConfig, StoreSettings } from '../../types';

interface BkashPraTabProps {
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
}

export const BkashPraTab: React.FC<BkashPraTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const accounts: BkashPraAccountConfig[] = settings.bkashPraAccounts || [
    {
      id: 'pra-1',
      gateway: 'bKash',
      praNumber: '01621871225',
      counterNo: '01',
      active: true,
    },
  ];

  const [praNumber, setPraNumber] = useState('');
  const [counterNo, setCounterNo] = useState('01');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!praNumber.trim()) return;

    let updatedAccounts: BkashPraAccountConfig[];
    if (editingId) {
      updatedAccounts = accounts.map((acc) =>
        acc.id === editingId
          ? {
              ...acc,
              praNumber: praNumber.trim(),
              counterNo: counterNo.trim() || '01',
            }
          : acc
      );
      setEditingId(null);
      showToast('বিকাশ PRA একাউন্ট সফলভাবে আপডেট হয়েছে!');
    } else {
      const newAcc: BkashPraAccountConfig = {
        id: `pra-${Date.now()}`,
        gateway: 'bKash',
        praNumber: praNumber.trim(),
        counterNo: counterNo.trim() || '01',
        active: true,
      };
      updatedAccounts = [...accounts, newAcc];
      showToast('নতুন বিকাশ PRA একাউন্ট সেভ হয়েছে!');
    }

    onUpdateSettings({
      ...settings,
      bkashPraAccounts: updatedAccounts,
    });

    setPraNumber('');
    setCounterNo('01');
  };

  const handleEdit = (acc: BkashPraAccountConfig) => {
    setEditingId(acc.id);
    setPraNumber(acc.praNumber);
    setCounterNo(acc.counterNo || '01');
  };

  const handleDelete = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    onUpdateSettings({
      ...settings,
      bkashPraAccounts: updated,
    });
    showToast('PRA একাউন্ট ডিলিট করা হয়েছে!');
  };

  const handleToggleActive = (id: string) => {
    const updated = accounts.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    onUpdateSettings({
      ...settings,
      bkashPraAccounts: updated,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6 text-slate-800">
      {/* Header: 🖊️ বিকাশ PRA একাউন্ট */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
          <span className="text-blue-500">🖊️</span>
          <span>বিকাশ PRA একাউন্ট (Personal Retail Account)</span>
        </div>
        {toastMsg && (
          <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              গেটওয়ে টাইপ
            </label>
            <input
              type="text"
              readOnly
              value="bKash (PRA Account)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-pink-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              বিকাশ PRA নম্বর*
            </label>
            <input
              type="tel"
              required
              value={praNumber}
              onChange={(e) => setPraNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">
              কাউন্টার নম্বর / রেফারেন্স
            </label>
            <input
              type="text"
              value={counterNo}
              onChange={(e) => setCounterNo(e.target.value)}
              placeholder="e.g. 01"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            />
          </div>
        </div>

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
                setPraNumber('');
                setCounterNo('01');
              }}
              className="px-3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold"
            >
              বাতিল
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="pt-4 border-t border-slate-100 overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="py-2.5 px-4 border-r border-slate-200 w-1/4">Gateway</th>
              <th className="py-2.5 px-4 border-r border-slate-200 w-1/3">PRA Number</th>
              <th className="py-2.5 px-4 border-r border-slate-200 w-1/6">Counter</th>
              <th className="py-2.5 px-4 border-r border-slate-200 text-center">Active</th>
              <th className="py-2.5 px-4 text-center">Edit</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  কোনো বিকাশ PRA একাউন্ট যুক্ত করা নেই
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-pink-600 border-r border-slate-200">
                    {acc.gateway}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 border-r border-slate-200 font-mono">
                    {acc.praNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600 border-r border-slate-200 font-mono">
                    {acc.counterNo || '01'}
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
