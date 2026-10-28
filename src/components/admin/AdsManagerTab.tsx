import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Save,
  Check,
  Code2,
  Search,
  Share2,
  ShieldCheck,
  HelpCircle,
  Activity,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { TrackingSettings } from '../../types';
import { AnimatedButton } from '../AnimatedButton';
import {
  extractPixelId,
  extractGoogleVerificationToken,
  sendTestPixelEvent,
} from '../../services/trackingService';

interface AdsManagerTabProps {
  tracking: TrackingSettings;
  onUpdateTracking: (tracking: TrackingSettings) => void;
}

export const AdsManagerTab: React.FC<AdsManagerTabProps> = ({
  tracking,
  onUpdateTracking,
}) => {
  const [fbPixelId, setFbPixelId] = useState(tracking.fbPixelId || '');
  const [googleSearchConsoleTag, setGoogleSearchConsoleTag] = useState(
    tracking.googleSearchConsoleTag || ''
  );
  const [ga4Id, setGa4Id] = useState(tracking.ga4Id || '');
  const [tiktokPixelId, setTiktokPixelId] = useState(tracking.tiktokPixelId || '');
  const [googleTagManagerId, setGoogleTagManagerId] = useState(
    tracking.googleTagManagerId || ''
  );
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const cleanPixel = extractPixelId(fbPixelId);
  const cleanGscToken = extractGoogleVerificationToken(googleSearchConsoleTag);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTracking({
      fbPixelId: cleanPixel || fbPixelId.trim(),
      googleSearchConsoleTag: cleanGscToken || googleSearchConsoleTag.trim(),
      ga4Id: ga4Id.trim(),
      tiktokPixelId: tiktokPixelId.trim(),
      googleTagManagerId: googleTagManagerId.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestPixel = () => {
    if (!cleanPixel) {
      setTestResult('অনুগ্রহ করে প্রথমে সঠিক Meta Pixel ID দিন।');
      return;
    }
    const res = sendTestPixelEvent(cleanPixel);
    setTestResult(res.message);
    setTimeout(() => setTestResult(null), 6000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>অ্যাডস ম্যানেজার ও সার্চ কনসোল</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Live Connected
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Meta Pixel, Google Search Console, Google Analytics 4, and conversion tracking live synchronization.
          </p>
        </div>

        {cleanPixel && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Pixel Active ({cleanPixel})
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Facebook Meta Pixel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                f
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Facebook / Meta Pixel Tracking</span>
                  {cleanPixel ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      ✓ Connected
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      Needs Pixel ID
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tracks PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase events on Facebook & Instagram Ads.
                </p>
              </div>
            </div>

            {cleanPixel && (
              <button
                type="button"
                onClick={handleTestPixel}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] border border-blue-200 cursor-pointer transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                Test Event
              </button>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Meta Pixel ID <span className="text-slate-400 font-normal">(15-16 Digit Number)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fbPixelId}
                onChange={(e) => setFbPixelId(e.target.value)}
                placeholder="e.g. 984102948192041"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTestPixel}
                disabled={!cleanPixel}
                className="sm:hidden px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs disabled:opacity-50"
              >
                Test
              </button>
            </div>
            {cleanPixel && cleanPixel !== fbPixelId.trim() && (
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">
                Detected Clean ID: <span className="font-mono font-bold">{cleanPixel}</span>
              </p>
            )}
          </div>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-medium text-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{testResult}</span>
            </motion.div>
          )}

          {cleanPixel && (
            <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Live Injected Code:
              </div>
              <code>{`<script>fbq('init', '${cleanPixel}'); fbq('track', 'PageView');</script>`}</code>
              <div className="text-[10px] text-slate-400">
                ✓ Auto-fires ViewContent on products, AddToCart on cart additions, and Purchase on order completion.
              </div>
            </div>
          )}
        </div>

        {/* Google Search Console */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-xs">
              G
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Google Search Console Ownership Verification</span>
                {cleanGscToken ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    ✓ Tag Injected in &lt;head&gt;
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Awaiting Token
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                Verify website ownership for Google Search ranking, indexing, and SEO traffic analytics.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Google HTML Verification Code or Full Meta Tag
            </label>
            <input
              type="text"
              value={googleSearchConsoleTag}
              onChange={(e) => setGoogleSearchConsoleTag(e.target.value)}
              placeholder='e.g. google-site-verification=XYZ123... or <meta name="google-site-verification" content="XYZ123..." />'
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-amber-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supports both the full HTML meta tag from Search Console or just the verification token.
            </p>
          </div>

          {cleanGscToken && (
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 font-mono text-[11px] text-amber-950 space-y-1">
              <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                Injected in Document Head:
              </div>
              <code className="block bg-white p-2 rounded border border-amber-200 text-slate-800 font-bold">
                {`<meta name="google-site-verification" content="${cleanGscToken}" />`}
              </code>
              <p className="text-[10px] text-amber-800">
                Click "Verify" in Google Search Console dashboard. The crawler will immediately find this tag in &lt;head&gt;.
              </p>
            </div>
          )}
        </div>

        {/* Google Analytics 4 (GA4) & GTM */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Google Analytics 4 (GA4) & Google Tag Manager (GTM)
              </h3>
              <p className="text-[11px] text-slate-500">
                Real-time traffic measurement, ecommerce purchase reports, and marketing tag management.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                GA4 Measurement ID (G-XXXXXXXXXX)
              </label>
              <input
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                placeholder="e.g. G-DUARI88921"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Google Tag Manager ID (GTM-XXXXXXX)
              </label>
              <input
                type="text"
                value={googleTagManagerId}
                onChange={(e) => setGoogleTagManagerId(e.target.value)}
                placeholder="e.g. GTM-DUARI77"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
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
            className="font-bold text-xs shadow-md"
          >
            {saved ? 'সংরক্ষিত ও ক্লাউডে সিঙ্ক হয়েছে (Saved & Synced)' : 'ট্র্যাকিং কোড সংরক্ষণ করুন (Save Settings)'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
};
