import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  Check,
  Building2,
  Truck,
  FileText,
  Palette,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Settings as SettingsIcon,
  Sparkles,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { StoreSettings, ColorSettings, SizeSettings } from '../../types';
import { AnimatedButton } from '../AnimatedButton';

interface SettingsTabProps {
  section:
    | 'business-info'
    | 'about-us'
    | 'terms'
    | 'delivery-charges'
    | 'return-policy'
    | 'color-settings'
    | 'size-settings';
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
}

const THEME_PRESETS: { name: string; colors: ColorSettings }[] = [
  {
    name: 'পার্পল ও ওশান ব্লু (Default Screenshot Theme)',
    colors: {
      topBarBg: '#734fba',
      topBarFont: '#ffffff',
      menuBarBg: '#14559c',
      menuBarFont: '#ffffff',
      cartIconBg: '#3f299c',
      cartIconFont: '#ffffff',
      buttonBg: '#030f78',
      buttonFont: '#ffffff',
      searchBorder: '#0e0d5c',
      priceColor: '#0022ff',
    },
  },
  {
    name: 'ডুয়ারি ক্লাসিক ব্লু (Duari Classic Blue)',
    colors: {
      topBarBg: '#0b245a',
      topBarFont: '#ffffff',
      menuBarBg: '#0f2e6e',
      menuBarFont: '#ffffff',
      cartIconBg: '#1d4ed8',
      cartIconFont: '#ffffff',
      buttonBg: '#0f2e6e',
      buttonFont: '#ffffff',
      searchBorder: '#2563eb',
      priceColor: '#1d4ed8',
    },
  },
  {
    name: 'এমারেল্ড গ্রিন (Emerald Green)',
    colors: {
      topBarBg: '#064e3b',
      topBarFont: '#ffffff',
      menuBarBg: '#059669',
      menuBarFont: '#ffffff',
      cartIconBg: '#047857',
      cartIconFont: '#ffffff',
      buttonBg: '#065f46',
      buttonFont: '#ffffff',
      searchBorder: '#10b981',
      priceColor: '#059669',
    },
  },
  {
    name: 'মিডনাইট লাক্সারি (Midnight Luxury Dark)',
    colors: {
      topBarBg: '#0f172a',
      topBarFont: '#ffffff',
      menuBarBg: '#1e293b',
      menuBarFont: '#ffffff',
      cartIconBg: '#334155',
      cartIconFont: '#ffffff',
      buttonBg: '#0f172a',
      buttonFont: '#ffffff',
      searchBorder: '#64748b',
      priceColor: '#38bdf8',
    },
  },
  {
    name: 'রুবি রেড ও অরেঞ্জ (Ruby Sunset)',
    colors: {
      topBarBg: '#7c2d12',
      topBarFont: '#ffffff',
      menuBarBg: '#c2410c',
      menuBarFont: '#ffffff',
      cartIconBg: '#b91c1c',
      cartIconFont: '#ffffff',
      buttonBg: '#991b1b',
      buttonFont: '#ffffff',
      searchBorder: '#ea580c',
      priceColor: '#dc2626',
    },
  },
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  section,
  settings,
  onUpdateSettings,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [hotline, setHotline] = useState(settings.hotline);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [insideCharge, setInsideCharge] = useState(settings.insideDeliveryCharge);
  const [outsideCharge, setOutsideCharge] = useState(settings.outsideDeliveryCharge);
  const [freeAbove, setFreeAbove] = useState(settings.freeShippingAbove);
  const [aboutUs, setAboutUs] = useState(settings.aboutUsText);
  const [terms, setTerms] = useState(settings.termsConditions);
  const [returns, setReturns] = useState(settings.returnPolicy);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [logo, setLogo] = useState(
    settings.logo || settings.bannerLogo?.url || '/src/assets/images/duari_logo_1791125380292.jpg'
  );

  // Color Settings (Matching Image 1)
  const defaultColors: ColorSettings = {
    topBarBg: settings.colors?.topBarBg || '#734fba',
    topBarFont: settings.colors?.topBarFont || '#ffffff',
    menuBarBg: settings.colors?.menuBarBg || '#14559c',
    menuBarFont: settings.colors?.menuBarFont || '#ffffff',
    cartIconBg: settings.colors?.cartIconBg || '#3f299c',
    cartIconFont: settings.colors?.cartIconFont || '#ffffff',
    buttonBg: settings.colors?.buttonBg || '#030f78',
    buttonFont: settings.colors?.buttonFont || '#ffffff',
    searchBorder: settings.colors?.searchBorder || '#0e0d5c',
    priceColor: settings.colors?.priceColor || '#0022ff',
  };

  const [topBarBg, setTopBarBg] = useState(defaultColors.topBarBg);
  const [topBarFont, setTopBarFont] = useState(defaultColors.topBarFont);
  const [menuBarBg, setMenuBarBg] = useState(defaultColors.menuBarBg);
  const [menuBarFont, setMenuBarFont] = useState(defaultColors.menuBarFont);
  const [cartIconBg, setCartIconBg] = useState(defaultColors.cartIconBg);
  const [cartIconFont, setCartIconFont] = useState(defaultColors.cartIconFont);
  const [buttonBg, setButtonBg] = useState(defaultColors.buttonBg);
  const [buttonFont, setButtonFont] = useState(defaultColors.buttonFont);
  const [searchBorder, setSearchBorder] = useState(defaultColors.searchBorder);
  const [priceColor, setPriceColor] = useState(defaultColors.priceColor);

  // Size Settings (Matching Image 2)
  const [mobileCols, setMobileCols] = useState<number>(
    settings.sizes?.mobileCols || 3
  );
  const [desktopCols, setDesktopCols] = useState<number>(
    settings.sizes?.desktopCols || 6
  );

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      storeName,
      tagline,
      hotline,
      email,
      address,
      insideDeliveryCharge: Number(insideCharge),
      outsideDeliveryCharge: Number(outsideCharge),
      freeShippingAbove: Number(freeAbove),
      aboutUsText: aboutUs,
      termsConditions: terms,
      returnPolicy: returns,
      primaryColor,
      logo,
      colors: {
        topBarBg,
        topBarFont,
        menuBarBg,
        menuBarFont,
        cartIconBg,
        cartIconFont,
        buttonBg,
        buttonFont,
        searchBorder,
        priceColor,
      },
      sizes: {
        mobileCols,
        desktopCols,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleApplyPreset = (presetColors: ColorSettings) => {
    setTopBarBg(presetColors.topBarBg);
    setTopBarFont(presetColors.topBarFont);
    setMenuBarBg(presetColors.menuBarBg);
    setMenuBarFont(presetColors.menuBarFont);
    setCartIconBg(presetColors.cartIconBg);
    setCartIconFont(presetColors.cartIconFont);
    setButtonBg(presetColors.buttonBg);
    setButtonFont(presetColors.buttonFont);
    setSearchBorder(presetColors.searchBorder);
    setPriceColor(presetColors.priceColor);
    setPrimaryColor(presetColors.buttonBg);
    setIsThemeModalOpen(false);
  };

  // Helper component for color picker input matching Screenshot 1 styling
  const ColorBoxInput = ({
    label,
    value,
    onChange,
    required = false,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    required?: boolean;
  }) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative flex items-center h-10 w-full rounded-md border border-slate-300 overflow-hidden bg-white p-1 hover:border-slate-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <input
            type="color"
            value={value || '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          />
          <div
            className="w-full h-full rounded border border-slate-200/60 shadow-inner flex items-center justify-between px-2 cursor-pointer transition-colors"
            style={{ backgroundColor: value || 'transparent' }}
          >
            <span
              className="text-[11px] font-mono font-bold tracking-wider select-none"
              style={{
                color:
                  value && value !== '#ffffff' && value !== 'white'
                    ? '#ffffff'
                    : '#334155',
                textShadow:
                  value && value !== '#ffffff'
                    ? '0 1px 2px rgba(0,0,0,0.6)'
                    : 'none',
              }}
            >
              {value || ''}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 1. SCREENSHOT 1: কালার সেটিংস (Color Settings)
  if (section === 'color-settings') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header matching Screenshot 1 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-500">
            <Pencil className="w-5 h-5 stroke-[2.2]" />
            <h2 className="text-lg font-bold tracking-tight text-blue-500">
              কালার সেটিংস
            </h2>
          </div>

          {/* Green button on top right: ⚙ থিম চেঞ্জ করুন */}
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="px-4 py-2 rounded-md bg-[#00d084] hover:bg-[#00b875] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4 animate-spin-slow" />
            <span>থিম চেঞ্জ করুন</span>
          </button>
        </div>

        {/* Form Grid with 10 fields matching Screenshot 1 */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Row 1 */}
            <ColorBoxInput
              label="টপ বার ব্যাকগ্রাউন্ড কালার"
              value={topBarBg}
              onChange={setTopBarBg}
            />
            <ColorBoxInput
              label="টপ বার ফন্ট কালার"
              value={topBarFont}
              onChange={setTopBarFont}
            />
            <ColorBoxInput
              label="মেনু বার ব্যাকগ্রাউন্ড কালার"
              value={menuBarBg}
              onChange={setMenuBarBg}
            />
            <ColorBoxInput
              label="মেনু বার ফন্ট কালার"
              value={menuBarFont}
              onChange={setMenuBarFont}
            />

            {/* Row 2 */}
            <ColorBoxInput
              label="কার্ট, প্রোফাইল আইকনস ব্যাকগ্রাউন্ড"
              value={cartIconBg}
              onChange={setCartIconBg}
            />
            <ColorBoxInput
              label="কার্ট, প্রোফাইল আইকনস ফন্ট কালার"
              value={cartIconFont}
              onChange={setCartIconFont}
            />
            <ColorBoxInput
              label="বাটন ব্যাকগ্রাউন্ড কালার"
              value={buttonBg}
              onChange={(val) => {
                setButtonBg(val);
                setPrimaryColor(val);
              }}
            />
            <ColorBoxInput
              label="বাটন ফন্ট কালার"
              value={buttonFont}
              onChange={setButtonFont}
            />

            {/* Row 3 */}
            <ColorBoxInput
              label="সার্চ বক্স বর্ডার কালার *"
              value={searchBorder}
              onChange={setSearchBorder}
              required
            />
            <ColorBoxInput
              label="প্রাইজ কালার *"
              value={priceColor}
              onChange={setPriceColor}
              required
            />
          </div>

          {/* Bottom Left Save Button matching Screenshot 1 */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-[#00d084] hover:bg-[#00b875] active:scale-95 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              {saved && <Check className="w-4 h-4 text-white" />}
              <span>{saved ? 'সংরক্ষিত হয়েছে' : 'তথ্য সেভ করুন'}</span>
            </button>

            {saved && (
              <span className="text-xs font-bold text-emerald-600 animate-fade-in">
                কালার সেটিংস সফলভাবে সেভ হয়েছে!
              </span>
            )}
          </div>
        </form>

        {/* Theme Preset Modal */}
        <AnimatePresence>
          {isThemeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-base text-slate-900">
                      রেডিমেড থিম নির্বাচন করুন (Select Theme)
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsThemeModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                  >
                    বন্ধ করুন
                  </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {THEME_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleApplyPreset(preset.colors)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 group-hover:text-blue-700">
                          {preset.name}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Apply
                        </span>
                      </div>

                      {/* Swatch bars */}
                      <div className="flex items-center gap-1.5 h-4">
                        <div
                          className="h-full flex-1 rounded"
                          style={{ backgroundColor: preset.colors.topBarBg }}
                          title="Top Bar"
                        />
                        <div
                          className="h-full flex-1 rounded"
                          style={{ backgroundColor: preset.colors.menuBarBg }}
                          title="Menu Bar"
                        />
                        <div
                          className="h-full flex-1 rounded"
                          style={{ backgroundColor: preset.colors.buttonBg }}
                          title="Button"
                        />
                        <div
                          className="h-full flex-1 rounded"
                          style={{ backgroundColor: preset.colors.priceColor }}
                          title="Price"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. SCREENSHOT 2: সাইজ সেটিংস (Size Settings)
  if (section === 'size-settings') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header matching Screenshot 2 */}
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 text-blue-500">
          <Pencil className="w-5 h-5 stroke-[2.2]" />
          <h2 className="text-lg font-bold tracking-tight text-blue-500">
            সাইজ সেটিংস
          </h2>
        </div>

        {/* Form matching Screenshot 2 */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: মোবাইলে প্রতি লাইনে কয়টি প্রোডাক্ট দেখাবে * */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                মোবাইলে প্রতি লাইনে কয়টি প্রোডাক্ট দেখাবে{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={mobileCols}
                onChange={(e) => setMobileCols(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs"
              >
                <option value={3}>৩ টি প্রোডাক্ট</option>
                <option value={2}>২ টি প্রোডাক্ট</option>
                <option value={4}>৪ টি প্রোডাক্ট</option>
              </select>
            </div>

            {/* Field 2: কম্পিউটারে প্রতি লাইনে কয়টি প্রোডাক্ট দেখাবে * */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                কম্পিউটারে প্রতি লাইনে কয়টি প্রোডাক্ট দেখাবে{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={desktopCols}
                onChange={(e) => setDesktopCols(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs"
              >
                <option value={9}>৯ টি প্রোডাক্ট</option>
                <option value={6}>৬ টি প্রোডাক্ট</option>
                <option value={4}>৪ টি প্রোডাক্ট</option>
                <option value={3}>৩ টি প্রোডাক্ট</option>
              </select>
            </div>
          </div>

          {/* Bottom Left Save Button matching Screenshot 2 */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-md bg-[#00d084] hover:bg-[#00b875] active:scale-95 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              {saved && <Check className="w-4 h-4 text-white" />}
              <span>{saved ? 'সংরক্ষিত হয়েছে' : 'তথ্য সেভ করুন'}</span>
            </button>

            {saved && (
              <span className="text-xs font-bold text-emerald-600 animate-fade-in">
                সাইজ সেটিংস সফলভাবে সেভ হয়েছে!
              </span>
            )}
          </div>
        </form>
      </div>
    );
  }

  // 3. Other General Settings (Business Info, Delivery Charges, Policies)
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {section === 'business-info' && 'যোগাযোগ ও ব্যবসায়িক তথ্য (Business Info)'}
          {section === 'delivery-charges' && 'ডেলিভারি চার্জ সেটিংস (Delivery Charges)'}
          {section === 'about-us' && 'আমাদের সম্পর্কে (About Us)'}
          {section === 'terms' && 'টার্মস এন্ড কন্ডিশন (Terms & Conditions)'}
          {section === 'return-policy' && 'অর্ডার এন্ড রিটার্ন পলিসি (Return Policy)'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business details, delivery rates, policies, and store theme styling.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs"
      >
        {/* Business Info Section */}
        {section === 'business-info' && (
          <div className="space-y-4">
            {/* Store Logo & Favicon Uploader */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block font-black text-slate-800 text-xs">
                    স্টোর লোগো ও ফেভিকন (Store Logo & Favicon)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    অ্যাডমিন যে লোগো আপলোড বা সিলেক্ট করবেন তা স্টোরের হেডার এবং ব্রাউজারের ফেভিকনে (Favicon) স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                  </p>
                </div>

                {logo && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs shrink-0">
                    <img
                      src={logo}
                      alt="Logo Preview"
                      className="w-8 h-8 rounded-lg object-contain bg-slate-50"
                    />
                    <div className="text-[10px]">
                      <span className="font-bold text-slate-800 block">Favicon Preview</span>
                      <span className="text-emerald-600 font-semibold">Active Logo</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://... অথবা নিচের আপলোড বাটন চাপুন"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-medium text-xs bg-white"
                />
                <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>কম্পিউটার/মোবাইল থেকে আপলোড</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setLogo(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  দোকানের নাম (Store Name)
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ট্যাগলাইন (Tagline)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  কাস্টমার হেল্পলাইন (Hotline)
                </label>
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  সাপোর্ট ইমেইল (Support Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ঠিকানা (Store Address)
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>
        )}

        {/* Delivery Charges Section */}
        {section === 'delivery-charges' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ঢাকার ভেতরে ডেলিভারি চার্জ (Inside City ৳)
                </label>
                <input
                  type="number"
                  value={insideCharge}
                  onChange={(e) => setInsideCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ঢাকার বাইরে ডেলিভারি চার্জ (Outside City ৳)
                </label>
                <input
                  type="number"
                  value={outsideCharge}
                  onChange={(e) => setOutsideCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ফ্রি ডেলিভারি মিনিমাম অর্ডার (Free Above ৳)
                </label>
                <input
                  type="number"
                  value={freeAbove}
                  onChange={(e) => setFreeAbove(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* About Us */}
        {section === 'about-us' && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              আমাদের সম্পর্কে (About Us Content)
            </label>
            <textarea
              rows={6}
              value={aboutUs}
              onChange={(e) => setAboutUs(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-sans leading-relaxed"
            />
          </div>
        )}

        {/* Terms & Conditions */}
        {section === 'terms' && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              টার্মস এন্ড কন্ডিশন (Terms & Conditions Content)
            </label>
            <textarea
              rows={6}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-sans leading-relaxed"
            />
          </div>
        )}

        {/* Return Policy */}
        {section === 'return-policy' && (
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              অর্ডার এন্ড রিটার্ন পলিসি (Return & Warranty Policy)
            </label>
            <textarea
              rows={6}
              value={returns}
              onChange={(e) => setReturns(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-sans leading-relaxed"
            />
          </div>
        )}

        {/* Save Button */}
        <div className="pt-3 flex justify-end">
          <AnimatedButton
            type="submit"
            variant="primary"
            size="md"
            leftIcon={
              saved ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
            className="font-bold text-xs"
          >
            {saved ? 'সংরক্ষিত হয়েছে (Saved)' : 'সেটিংস সংরক্ষণ করুন (Save Changes)'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
};
