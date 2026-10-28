import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { GatewayControlConfig, StoreSettings } from '../../types';

interface GatewayControlTabProps {
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
}

export const GatewayControlTab: React.FC<GatewayControlTabProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const currentConfig: GatewayControlConfig = settings.gatewayControl || {
    availableGateways: ['Nagad'],
    paymentType: 'delivery_charge',
    checkoutTiming: 'mandatory',
    showAfterOrder: true,
    mapping: {
      bkash: 'PERSONAL ACCOUNT',
      nagad: 'PERSONAL ACCOUNT',
      rocket: 'PERSONAL ACCOUNT',
    },
  };

  const [availableGateways, setAvailableGateways] = useState<string[]>(
    currentConfig.availableGateways || ['Nagad']
  );
  const [paymentType, setPaymentType] = useState<'delivery_charge' | 'full_payment'>(
    currentConfig.paymentType || 'delivery_charge'
  );
  const [checkoutTiming, setCheckoutTiming] = useState<'no_need' | 'mandatory' | 'optional'>(
    currentConfig.checkoutTiming || 'mandatory'
  );
  const [showAfterOrder, setShowAfterOrder] = useState<boolean>(
    currentConfig.showAfterOrder !== undefined ? currentConfig.showAfterOrder : true
  );
  const [mapping, setMapping] = useState(
    currentConfig.mapping || {
      bkash: 'PERSONAL ACCOUNT',
      nagad: 'PERSONAL ACCOUNT',
      rocket: 'PERSONAL ACCOUNT',
    }
  );

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toggleGateway = (gw: string) => {
    if (availableGateways.includes(gw)) {
      setAvailableGateways(availableGateways.filter((g) => g !== gw));
    } else {
      setAvailableGateways([...availableGateways, gw]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: GatewayControlConfig = {
      availableGateways,
      paymentType,
      checkoutTiming,
      showAfterOrder,
      mapping,
    };

    onUpdateSettings({
      ...settings,
      gatewayControl: updatedConfig,
    });

    setToastMsg('গেটওয়ে কন্ট্রোল সেটিংস সফলভাবে সেভ হয়েছে!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6 text-slate-800">
      {/* Header matching screenshot: 🖊️ গেটওয়ে কন্ট্রোল */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
          <span className="text-blue-500">🖊️</span>
          <span>গেটওয়ে কন্ট্রোল</span>
        </div>
        {toastMsg && (
          <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs text-slate-700">
        {/* 1. কি কি পেমেন্ট অপশন থাকবে?* */}
        <div className="space-y-2">
          <label className="block font-medium text-slate-700">
            কি কি পেমেন্ট অপশন থাকবে?<span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-5">
            {['bKash', 'Nagad', 'Rocket'].map((gw) => {
              const isChecked = availableGateways.includes(gw);
              return (
                <label key={gw} className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleGateway(gw)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
                  />
                  <span>{gw}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. পেমেন্ট গ্রহণের ধরন* */}
        <div className="space-y-2">
          <label className="block font-medium text-slate-700">
            পেমেন্ট গ্রহণের ধরন<span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-800">
              <input
                type="radio"
                name="paymentType"
                checked={paymentType === 'delivery_charge'}
                onChange={() => setPaymentType('delivery_charge')}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
              />
              <span>ডেলিভারি চার্জ</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-800">
              <input
                type="radio"
                name="paymentType"
                checked={paymentType === 'full_payment'}
                onChange={() => setPaymentType('full_payment')}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
              />
              <span>ফুল পেমেন্ট</span>
            </label>
          </div>
        </div>

        {/* 3. কাস্টমার অর্ডার প্রেস করার সময় পেমেন্ট অপশন কিভাবে আসবে?* */}
        <div className="space-y-2">
          <label className="block font-medium text-slate-700">
            কাস্টমার অর্ডার প্রেস করার সময় পেমেন্ট অপশন কিভাবে আসবে?<span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-800">
              <input
                type="radio"
                name="checkoutTiming"
                checked={checkoutTiming === 'no_need'}
                onChange={() => setCheckoutTiming('no_need')}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
              />
              <span>পেমেন্ট অপশন দেখানোর প্রয়োজন নেই।</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-800">
              <input
                type="radio"
                name="checkoutTiming"
                checked={checkoutTiming === 'mandatory'}
                onChange={() => setCheckoutTiming('mandatory')}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
              />
              <span>বাধ্যতামূলক পেমেন্ট করে অর্ডার প্রেস করতে হবে।</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-800">
              <input
                type="radio"
                name="checkoutTiming"
                checked={checkoutTiming === 'optional'}
                onChange={() => setCheckoutTiming('optional')}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
              />
              <span>পেমেন্ট অপশন অপশনাল হিসেবে থাকবে।</span>
            </label>
          </div>
        </div>

        {/* 4. অর্ডার প্রেস করার পর পেমেন্ট অপশন দেখাবে কিনা?* */}
        <div className="space-y-2">
          <label className="block font-medium text-slate-700">
            অর্ডার প্রেস করার পর পেমেন্ট অপশন দেখাবে কিনা?<span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-800">
              <input
                type="radio"
                name="showAfterOrder"
                checked={!showAfterOrder}
                onChange={() => setShowAfterOrder(false)}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
              />
              <span>না</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium text-slate-800">
              <input
                type="radio"
                name="showAfterOrder"
                checked={showAfterOrder}
                onChange={() => setShowAfterOrder(true)}
                className="w-4 h-4 text-emerald-500 focus:ring-emerald-400 accent-[#00d084]"
              />
              <span>হ্যাঁ</span>
            </label>
          </div>
        </div>

        {/* 5. গেটওয়ে ম্যাপিং */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-blue-600 font-semibold text-xs">গেটওয়ে ম্যাপিং</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* বিকাশে ক্লিক করলে কোন গেটওয়ে ওপেন হবে* */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                বিকাশে ক্লিক করলে কোন গেটওয়ে ওপেন হবে*
              </label>
              <select
                value={mapping.bkash}
                onChange={(e) =>
                  setMapping({ ...mapping, bkash: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-800 uppercase"
              >
                <option value="PERSONAL ACCOUNT">PERSONAL ACCOUNT</option>
                <option value="PRA ACCOUNT">PRA ACCOUNT</option>
                <option value="MERCHANT ACCOUNT">MERCHANT ACCOUNT</option>
              </select>
            </div>

            {/* নগদে ক্লিক করলে কোন গেটওয়ে ওপেন হবে* */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                নগদে ক্লিক করলে কোন গেটওয়ে ওপেন হবে*
              </label>
              <select
                value={mapping.nagad}
                onChange={(e) =>
                  setMapping({ ...mapping, nagad: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-800 uppercase"
              >
                <option value="PERSONAL ACCOUNT">PERSONAL ACCOUNT</option>
                <option value="PRA ACCOUNT">PRA ACCOUNT</option>
                <option value="MERCHANT ACCOUNT">MERCHANT ACCOUNT</option>
              </select>
            </div>

            {/* রকেটে ক্লিক করলে কোন গেটওয়ে ওপেন হবে* */}
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                রকেটে ক্লিক করলে কোন গেটওয়ে ওপেন হবে*
              </label>
              <select
                value={mapping.rocket}
                onChange={(e) =>
                  setMapping({ ...mapping, rocket: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 bg-white font-medium text-slate-800 uppercase"
              >
                <option value="PERSONAL ACCOUNT">PERSONAL ACCOUNT</option>
                <option value="PRA ACCOUNT">PRA ACCOUNT</option>
                <option value="MERCHANT ACCOUNT">MERCHANT ACCOUNT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button: সেভ করুন */}
        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#00d084] hover:bg-[#00b975] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            সেভ করুন
          </button>
        </div>
      </form>
    </div>
  );
};
