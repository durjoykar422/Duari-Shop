import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { AnimatedButton } from './AnimatedButton';

export type CustomerCareTab = 'delivery' | 'cod' | 'returns' | 'about' | 'contact';

interface CustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: CustomerCareTab;
  onSelectTab: (tab: CustomerCareTab) => void;
  settings: StoreSettings;
  onOpenVerify?: () => void;
  lang?: 'en' | 'bn';
}

export const CustomerCareModal: React.FC<CustomerCareModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  settings,
  onOpenVerify,
  lang = 'bn',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header with Title and Close Button */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                কাস্টমার কেয়ার ও পলিসি (Customer Care)
              </h2>
              <p className="text-xs text-slate-500">
                {settings.storeName || 'Duari Shop'} এর অফিসিয়াল টার্মস, ডেলিভারি ও রিটার্ন নির্দেশিকা
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-3 bg-slate-100/70 border-b border-slate-200/80 overflow-x-auto text-xs font-bold scrollbar-none select-none">
          <button
            onClick={() => onSelectTab('delivery')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'delivery'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Doorstep Delivery Policy</span>
          </button>

          <button
            onClick={() => onSelectTab('cod')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'cod'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cash On Delivery Terms</span>
          </button>

          <button
            onClick={() => onSelectTab('returns')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'returns'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>7 Days Return & Refund</span>
          </button>

          <button
            onClick={() => onSelectTab('about')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => onSelectTab('contact')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'contact'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact & Support</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: DELIVERY POLICY */}
          {activeTab === 'delivery' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-blue-950 text-sm">
                    হোম ডেলিভারি চার্জের তালিকা (Delivery Rates)
                  </h3>
                  <p className="text-xs text-blue-700 mt-0.5">
                    অ্যাডমিন কর্তৃক নির্ধারিত সর্বশেষ ডেলিভারি রেট
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 font-extrabold text-blue-900 text-xs shadow-2xs">
                    ঢাকার ভিতরে: ৳ {settings.insideDeliveryCharge}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 font-extrabold text-blue-900 text-xs shadow-2xs">
                    ঢাকার বাইরে: ৳ {settings.outsideDeliveryCharge}
                  </span>
                </div>
              </div>

              {settings.freeShippingAbove > 0 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ৳ {settings.freeShippingAbove.toLocaleString()} বা তার বেশি অর্ডারে ফ্রি ডেলিভারি সুবিধা প্রযোজ্য!
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  ডেলিভারির নিয়ম ও সময়সীমা:
                </h4>
                <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>ডেলিভারি সময়:</strong> ঢাকা সিটির ভিতরে ২৪ থেকে ৪৮ ঘণ্টা এবং ঢাকার বাইরে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন করা হয়।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>কুরিয়ার পার্টনার:</strong> পাঠাও (Pathao), রেডএক্স (RedX), পেপারফ্লাই ও স্টিডফাস্ট কুরিয়ারের মাধ্যমে সরাসরি আপনার দরজায় পৌঁছানো হয়।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>চেক করে রিসিভ:</strong> ডেলিভারি ম্যানের সামনে পার্সেলের ভেতরের সঠিক পণ্যটি দেখে বুঝে নিয়ে ক্যাশ অন ডেলিভারি মূল্য পরিশোধ করুন।
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: CASH ON DELIVERY TERMS */}
          {activeTab === 'cod' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  ক্যাশ অন ডেলিভারি শর্তাবলী (Cash On Delivery Terms)
                </h3>
                <p className="text-xs text-amber-800">
                  কোনো প্রকার অগ্রিম টাকা ছাড়াই নিশ্চিন্তে পণ্য অর্ডার করুন।
                </p>
              </div>

              {/* Admin Configured Terms */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  স্টোর নীতিমালা
                </span>
                <p className="whitespace-pre-line text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {settings.termsConditions ||
                    '১. ক্যাশ অন ডেলিভারিতে কোনো প্রকার অগ্রিম পেমেন্টের প্রয়োজন নেই।\n২. ডেলিভারিম্যানের সামনে পার্সেল খুলে সঠিক প্রোডাক্ট বুঝে নিন।\n৩. কোনো অসঙ্গতি দেখলে সাথে সাথে হটলাইনে যোগাযোগ করুন।'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 text-xs block">
                    ১০০% ক্যাশ অন ডেলিভারি
                  </span>
                  <p className="text-[11px] text-slate-500">
                    পণ্য হাতে পাওয়ার আগে ১ টাকাও অগ্রিম দিতে হবে না।
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 text-xs block">
                    ডিজিটাল পেমেন্ট সাপোর্ট
                  </span>
                  <p className="text-[11px] text-slate-500">
                    বিকাশ, নগদ, রকেট বা কার্ডের মাধ্যমেও পেমেন্ট গ্রহণ করা হয়।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 7 DAYS RETURN & REFUND */}
          {activeTab === 'returns' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  ৭ দিনের সহজ রিটার্ন ও রিফান্ড পলিসি
                </h3>
                <p className="text-xs text-emerald-800">
                  পণ্য পাওয়ার পর ৭ দিনের মধ্যে কোনো ত্রুটি থাকলে ফ্রি রিপ্লেসমেন্ট।
                </p>
              </div>

              {/* Admin Configured Return Policy */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  রিটার্ন সংক্রান্ত নিয়মাবলী
                </span>
                <p className="whitespace-pre-line text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {settings.returnPolicy ||
                    '১. প্রোডাক্ট পাওয়ার ৭ দিনের মধ্যে ত্রুটি থাকলে সম্পূর্ণ ফ্রি রিপ্লেসমেন্ট দেওয়া হবে।\n২. পার্সেল খোলার সময় একটি আনবক্সিং ভিডিও করে রাখার অনুরোধ করা হলো।\n৩. যেকোনো সমস্যায় আমাদের হটলাইনে কল করুন।'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-blue-900 text-xs block">
                    রিটার্ন বা রিপ্লেসমেন্ট রিকোয়েস্ট করতে চান?
                  </span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    আমাদের কাস্টমার কেয়ার প্রতিনিধির সাথে সরাসরি কথা বলুন
                  </p>
                </div>
                <a
                  href={`tel:${settings.hotline}`}
                  className="px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>কল করুন: {settings.hotline}</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-black text-slate-900 text-sm">
                  {settings.storeName || 'Duari Shop'} সম্পর্কে
                </h3>
                <p className="whitespace-pre-line text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {settings.aboutUsText ||
                    'Duari Shop হলো বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। আমরা শতভাগ আসল গ্যাজেট, ইলেকট্রনিক্স ও লাইফস্টাইল পণ্য সরাসরি কাস্টমারের কাছে পৌঁছে দিই।'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>হটলাইন</span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-800">
                    {settings.hotline || '01621871225'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    <span>ইমেইল</span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-800 truncate">
                    {settings.email || 'support@duarishop.com'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>অফিস ঠিকানা</span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-800 truncate">
                    {settings.address || 'Mymensingh, Bangladesh'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT & SUPPORT */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-1">
                <h3 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  কাস্টমার সাপোর্ট ও যোগাযোগের মাধ্যম
                </h3>
                <p className="text-xs text-blue-700">
                  যেকোনো প্রশ্ন, অর্ডার অনুসন্ধান বা তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Hotline Card */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-700" />
                    </div>
                    <span>হটলাইন সাপোর্ট (Hotline)</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {settings.hotline || '01621871225'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    সকাল ১০:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত খোলা
                  </p>
                  <a
                    href={`tel:${settings.hotline || '01621871225'}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                  >
                    <span>সরাসরি কল করুন</span>
                  </a>
                </div>

                {/* Email Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-slate-700" />
                    </div>
                    <span>ইমেইল সাপোর্ট (Email)</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {settings.email || 'support@duarishop.com'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ২৪ ঘণ্টার মধ্যে সকল ইমেইলের উত্তর দেওয়া হয়
                  </p>
                  <a
                    href={`mailto:${settings.email || 'support@duarishop.com'}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                  >
                    <span>ইমেইল পাঠান</span>
                  </a>
                </div>

                {/* Address Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-slate-700" />
                    </div>
                    <span>অফিস ও হাবের ঠিকানা (Address)</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {settings.address || 'Mymensingh Sadar, College Road, Bangladesh'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    সেন্ট্রাল ওয়্যারহাউস ও ডিস্ট্রিবিউশন হাব • {settings.storeName || 'Duari Shop'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {onOpenVerify ? (
            <button
              onClick={() => {
                onClose();
                onOpenVerify();
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>অর্ডার ট্র্যাক করতে চান? ক্লিক করুন</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              {settings.storeName || 'Duari Shop'} 24/7 Support
            </span>
          )}

          <AnimatedButton
            variant="primary"
            size="sm"
            onClick={onClose}
            className="text-xs font-bold"
          >
            বন্ধ করুন (Close)
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  );
};
