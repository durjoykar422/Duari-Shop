import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  ToggleLeft,
  ToggleRight,
  Timer,
  Calendar,
} from 'lucide-react';
import { Product, LandingPageConfig } from '../../types';
import { AnimatedButton } from '../AnimatedButton';
import {
  getLandingPageScheduleStatus,
  formatDisplayDateTime,
  ScheduleStatusType,
} from '../../utils/scheduleUtils';

interface LandingPageBuilderTabProps {
  products: Product[];
  landingPages: LandingPageConfig[];
  onAddLandingPage: (camp: LandingPageConfig) => void;
  onUpdateLandingPage: (camp: LandingPageConfig) => void;
  onDeleteLandingPage: (id: string) => void;
  onViewLandingPage: (productId: string, campaignId?: string) => void;
}

export const LandingPageBuilderTab: React.FC<LandingPageBuilderTabProps> = ({
  products,
  landingPages,
  onAddLandingPage,
  onUpdateLandingPage,
  onDeleteLandingPage,
  onViewLandingPage,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<LandingPageConfig | null>(null);
  const [deletingCamp, setDeletingCamp] = useState<LandingPageConfig | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Create & Edit
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [formTitle, setFormTitle] = useState('');
  const [formHeadline, setFormHeadline] = useState('');
  const [formBanglaHeadline, setFormBanglaHeadline] = useState('');
  const [formSubheadline, setFormSubheadline] = useState('');
  const [formBadge, setFormBadge] = useState('🔥 মেগা ক্যাম্পেইন ডিসকাউন্ট');
  const [formOfferPrice, setFormOfferPrice] = useState<number>(0);
  const [formRegularPrice, setFormRegularPrice] = useState<number>(0);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formActive, setFormActive] = useState(true);
  // Schedule timing states
  const [formIsScheduled, setFormIsScheduled] = useState(true);
  const [formStartDate, setFormStartDate] = useState('2026-10-11');
  const [formStartTime, setFormStartTime] = useState('00:00');
  const [formEndDate, setFormEndDate] = useState('2026-10-18');
  const [formEndTime, setFormEndTime] = useState('23:59');

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'scheduled' | 'expired'>('all');

  const [formFeatures, setFormFeatures] = useState<string[]>([
    '১০০% অরিজিনাল অথেনটিক প্রোডাক্ট',
    'সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি',
    'পার্সেল খুলে চেক করে টাকা পরিশোধের সুযোগ',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Schedule Quick Preset Handlers
  const handleSetLandingLiveNow = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentHour = String(today.getHours()).padStart(2, '0');
    const currentMin = String(today.getMinutes()).padStart(2, '0');
    setFormStartDate(todayStr);
    setFormStartTime(`${currentHour}:${currentMin}`);
  };

  const handleSetLandingDuration = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setFormEndDate(target.toISOString().split('T')[0]);
    setFormEndTime('23:59');
  };

  // Summary counts
  const stats = landingPages.reduce(
    (acc, camp) => {
      const st = getLandingPageScheduleStatus(camp).status;
      if (st === 'live') acc.live++;
      else if (st === 'scheduled') acc.scheduled++;
      else if (st === 'expired') acc.expired++;
      return acc;
    },
    { live: 0, scheduled: 0, expired: 0 }
  );

  const filteredLandingPages = landingPages.filter((camp) => {
    if (statusFilter === 'all') return true;
    const st = getLandingPageScheduleStatus(camp).status;
    return st === statusFilter;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultProd = products[0];
    if (defaultProd) {
      setSelectedProductId(defaultProd.id);
      setFormTitle(`${defaultProd.title.slice(0, 30)} Promo Page`);
      setFormHeadline(defaultProd.banglaTitle || defaultProd.title);
      setFormBanglaHeadline(defaultProd.banglaTitle || defaultProd.title);
      setFormSubheadline(
        '১০০% আসল প্রোডাক্ট, দ্রুততম হোম ডেলিভারি এবং পার্সেল খুলে চেক করে পেমেন্ট করার শতভাগ নিশ্চয়তা।'
      );
      setFormBadge('🔥 মেগা অফার ডিসকাউন্ট');
      setFormOfferPrice(defaultProd.price);
      setFormRegularPrice(defaultProd.originalPrice || defaultProd.price + 400);
      setFormVideoUrl(defaultProd.videoUrl || '');
    } else {
      setSelectedProductId('');
      setFormTitle('নতুন ক্যাম্পেইন ল্যান্ডিং পেজ');
      setFormHeadline('');
      setFormBanglaHeadline('');
      setFormSubheadline('১০০% আসল প্রোডাক্ট এবং দ্রুত হোম ডেলিভারি সুবিধা।');
      setFormBadge('🔥 মেগা অফার ডিসকাউন্ট');
      setFormOfferPrice(0);
      setFormRegularPrice(0);
      setFormVideoUrl('');
    }
    setFormActive(true);

    // Default schedule timing: today to 7 days later
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentHour = String(today.getHours()).padStart(2, '0');
    const currentMin = String(today.getMinutes()).padStart(2, '0');
    setFormIsScheduled(true);
    setFormStartDate(todayStr);
    setFormStartTime(`${currentHour}:${currentMin}`);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormEndDate(nextWeek.toISOString().split('T')[0]);
    setFormEndTime('23:59');

    setFormFeatures([
      '১০০% অরিজিনাল অথেনটিক প্রোডাক্ট',
      'সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি',
      'পার্সেল খুলে চেক করে টাকা পরিশোধের সুযোগ',
      '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি',
    ]);
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (camp: LandingPageConfig) => {
    setEditingCamp(camp);
    setSelectedProductId(camp.productId);
    setFormTitle(camp.title);
    setFormHeadline(camp.headline);
    setFormBanglaHeadline(camp.banglaHeadline || camp.headline);
    setFormSubheadline(camp.subheadline || '');
    setFormBadge(camp.badge || '🔥 মেগা ক্যাম্পেইন ডিসকাউন্ট');
    setFormOfferPrice(camp.offerPrice);
    setFormRegularPrice(camp.regularPrice);
    setFormVideoUrl(camp.videoUrl || '');
    setFormActive(camp.active);

    setFormIsScheduled(camp.isScheduled !== undefined ? camp.isScheduled : true);
    setFormStartDate(camp.startDate || new Date().toISOString().split('T')[0]);
    setFormStartTime(camp.startTime || '00:00');
    setFormEndDate(camp.endDate || '2026-10-31');
    setFormEndTime(camp.endTime || '23:59');

    setFormFeatures(
      camp.features && camp.features.length > 0
        ? [...camp.features]
        : [
            '১০০% অরিজিনাল অথেনটিক প্রোডাক্ট',
            'সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি',
          ]
    );
  };

  // Submit Create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const scheduleStartStr = `${formStartDate}T${formStartTime || '00:00'}`;
    const scheduleEndStr = `${formEndDate}T${formEndTime || '23:59'}`;

    const newCamp: LandingPageConfig = {
      id: `camp-${Date.now()}`,
      productId: prod.id,
      title: formTitle.trim() || `${prod.title} Campaign`,
      headline: formHeadline.trim() || prod.title,
      banglaHeadline: formBanglaHeadline.trim() || prod.banglaTitle || formHeadline,
      subheadline: formSubheadline.trim(),
      badge: formBadge.trim(),
      offerPrice: Number(formOfferPrice) || prod.price,
      regularPrice: Number(formRegularPrice) || prod.originalPrice || prod.price + 500,
      videoUrl: formVideoUrl.trim() || undefined,
      active: formActive,
      isScheduled: formIsScheduled,
      startDate: formStartDate,
      startTime: formStartTime,
      scheduleStart: scheduleStartStr,
      endDate: formEndDate,
      endTime: formEndTime,
      scheduleEnd: scheduleEndStr,
      features: formFeatures.filter((f) => f.trim().length > 0),
    };

    onAddLandingPage(newCamp);
    setIsCreateOpen(false);
    showToast('নতুন ল্যান্ডিং পেইজ সফলভাবে শিডিউল ও তৈরি হয়েছে!');
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCamp) return;

    const scheduleStartStr = `${formStartDate}T${formStartTime || '00:00'}`;
    const scheduleEndStr = `${formEndDate}T${formEndTime || '23:59'}`;

    const updated: LandingPageConfig = {
      ...editingCamp,
      productId: selectedProductId,
      title: formTitle.trim() || editingCamp.title,
      headline: formHeadline.trim() || editingCamp.headline,
      banglaHeadline: formBanglaHeadline.trim() || editingCamp.banglaHeadline,
      subheadline: formSubheadline.trim(),
      badge: formBadge.trim(),
      offerPrice: Number(formOfferPrice),
      regularPrice: Number(formRegularPrice),
      videoUrl: formVideoUrl.trim() || undefined,
      active: formActive,
      isScheduled: formIsScheduled,
      startDate: formStartDate,
      startTime: formStartTime,
      scheduleStart: scheduleStartStr,
      endDate: formEndDate,
      endTime: formEndTime,
      scheduleEnd: scheduleEndStr,
      features: formFeatures.filter((f) => f.trim().length > 0),
    };

    onUpdateLandingPage(updated);
    setEditingCamp(null);
    showToast('ল্যান্ডিং পেইজ শিডিউল ও তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingCamp) return;
    onDeleteLandingPage(deletingCamp.id);
    showToast(`"${deletingCamp.title}" ল্যান্ডিং পেইজটি মুছে ফেলা হয়েছে!`);
    setDeletingCamp(null);
  };

  // Toggle Active/Inactive
  const handleToggleStatus = (camp: LandingPageConfig) => {
    const updated = { ...camp, active: !camp.active };
    onUpdateLandingPage(updated);
    showToast(
      updated.active
        ? `"${camp.title}" লাইভ করা হয়েছে!`
        : `"${camp.title}" ইনঅ্যাক্টিভ করা হয়েছে!`
    );
  };

  // Handle Copy Link
  const handleCopyLink = (camp: LandingPageConfig) => {
    const url = `${window.location.origin}/?landing=${camp.productId}&camp=${camp.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(camp.id);
    showToast('ল্যান্ডিং পেইজ লিঙ্ক কপি করা হয়েছে!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add Feature item
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#102a6b] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-blue-400"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner matching Image 1 */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 font-bold">
                <FileText className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                  <span>ল্যান্ডিং পেইজ ম্যানেজার ও বিল্ডার (Landing Pages)</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                    {landingPages.length} Total
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {stats.live} Live Now
                  </span>
                  {stats.scheduled > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      {stats.scheduled} Scheduled
                    </span>
                  )}
                  {stats.expired > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">
                      {stats.expired} Expired
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  স্পেশাল প্রোডাক্ট ক্যাম্পেইন, শিডিউল টাইমিং, অফার প্রাইস, ভিডিও এবং ১-ক্লিক অর্ডার ফর্ম সহ ডেডিকেটেড সেলস পেইজ
                </p>
              </div>
            </div>
          </div>

          <AnimatedButton
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold text-xs shadow-md shrink-0"
          >
            নতুন ল্যান্ডিং পেইজ তৈরি করুন
          </AnimatedButton>
        </div>

        {/* Schedule Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল পেইজ ({landingPages.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('live')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'live'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Now ({stats.live})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'scheduled'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            শিডিউল করা ({stats.scheduled})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            মেয়াদ শেষ ({stats.expired})
          </button>
        </div>
      </div>

      {/* Campaign Cards List with Edit, Delete & Status */}
      <div className="space-y-3.5">
        {filteredLandingPages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-sm">
              কোনো ল্যান্ডিং পেইজ পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-500">
              উপরের বাটনে ক্লিক করে আপনার প্রোডাক্টের জন্য একটি ল্যান্ডিং পেইজ তৈরি ও শিডিউল করুন।
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
            >
              + নতুন তৈরি করুন
            </button>
          </div>
        ) : (
          filteredLandingPages.map((camp) => {
            const product =
              products.find((p) => p.id === camp.productId) || products[0] || {
                id: 'prod-unknown',
                title: 'Product',
                image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
              };
            const schedStatus = getLandingPageScheduleStatus(camp);

            return (
              <div
                key={camp.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:border-blue-400 transition-all group"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative group">
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {camp.videoUrl && (
                      <span className="absolute bottom-1 right-1 p-1 rounded-md bg-purple-600 text-white">
                        <Play className="w-2.5 h-2.5 fill-white" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-blue-950 text-sm truncate block">
                        {camp.title}
                      </span>

                      {/* Schedule Status Badge */}
                      <button
                        onClick={() => handleToggleStatus(camp)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer flex items-center gap-1 ${
                          schedStatus.status === 'live'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : schedStatus.status === 'scheduled'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : schedStatus.status === 'expired'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            schedStatus.status === 'live'
                              ? 'bg-emerald-500 animate-pulse'
                              : schedStatus.status === 'scheduled'
                              ? 'bg-amber-500'
                              : schedStatus.status === 'expired'
                              ? 'bg-rose-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>{schedStatus.label}</span>
                      </button>

                      {camp.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          {camp.badge}
                        </span>
                      )}

                      {/* Schedule Time Pill */}
                      {schedStatus.status === 'scheduled' && schedStatus.timeRemainingText && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 text-[10px] font-extrabold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>শুরু: {schedStatus.timeRemainingText} পর</span>
                        </span>
                      )}

                      {schedStatus.status === 'live' && schedStatus.timeRemainingText && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 text-[10px] font-extrabold flex items-center gap-1">
                          <Timer className="w-3 h-3 text-emerald-600" />
                          <span>মেয়াদ বাকি: {schedStatus.timeRemainingText}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 truncate max-w-xl font-medium">
                      {camp.banglaHeadline || camp.headline}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-bold flex-wrap">
                      <span className="text-blue-700 font-extrabold">
                        অফার মূল্য: ৳ {camp.offerPrice.toLocaleString()}
                      </span>
                      {camp.regularPrice > camp.offerPrice && (
                        <span className="text-slate-400 line-through">
                          ৳ {camp.regularPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        {camp.features?.length || 0} টি হাইলাইটস ফিচার
                      </span>

                      {/* Display Start & End Schedule dates */}
                      {camp.startDate && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {formatDisplayDateTime(camp.startDate, camp.startTime)} – {formatDisplayDateTime(camp.endDate, camp.endTime)}
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: View, Edit, Delete, Copy Link */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(camp)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                    title="Copy Landing Page Share Link"
                  >
                    {copiedId === camp.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* EDIT BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(camp)}
                    className="px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Edit Landing Page"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>এডিট (Edit)</span>
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    onClick={() => setDeletingCamp(camp)}
                    className="p-2.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                    title="Delete Landing Page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* VIEW LANDING PAGE BUTTON */}
                  <button
                    type="button"
                    onClick={() => onViewLandingPage(camp.productId, camp.id)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-lg active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Landing Page</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {(isCreateOpen || editingCamp) && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      {editingCamp ? 'ল্যান্ডিং পেইজ এডিট করুন (Edit Landing Page)' : 'নতুন ল্যান্ডিং পেইজ তৈরি করুন (Create Landing Page)'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      প্রোডাক্ট, ক্যাম্পেইন টাইটেল, অফার প্রাইস ও ফিচার কনফিগার করুন
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCamp(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={editingCamp ? handleEditSubmit : handleCreateSubmit}
                className="p-6 overflow-y-auto space-y-4 flex-1 text-xs"
              >
                {/* 1. Associated Product */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাম্পেইন প্রোডাক্ট নির্বাচন করুন <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = products.find((x) => x.id === e.target.value);
                      if (p && !editingCamp) {
                        setFormHeadline(p.banglaTitle || p.title);
                        setFormOfferPrice(p.price);
                        setFormRegularPrice(p.originalPrice || p.price + 500);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} — ৳ {p.price} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Campaign Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাম্পেইন টাইটেল (Internal Campaign Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. J36 Ultra Promo Campaign Landing Page"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* 3. Headlines */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মূল হেডলাইন (Bangla Headline on Page) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formBanglaHeadline}
                      onChange={(e) => setFormBanglaHeadline(e.target.value)}
                      placeholder="e.g. J36 আল্ট্রা অল-ইন-ওয়ান হ্যান্ডহেল্ড গেমিং কনসোল"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সাব-হেডলাইন (Subheadline description)
                    </label>
                    <textarea
                      rows={2}
                      value={formSubheadline}
                      onChange={(e) => setFormSubheadline(e.target.value)}
                      placeholder="e.g. ১০০% আসল প্রোডাক্ট, দ্রুততম হোম ডেলিভারি এবং পার্সেল খুলে চেক করে পেমেন্ট করার শতভাগ নিশ্চয়তা।"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* 4. Pricing & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      অফার মূল্য (Offer Price ৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formOfferPrice}
                      onChange={(e) => setFormOfferPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      রেগুলার মূল্য (Regular Price ৳)
                    </label>
                    <input
                      type="number"
                      value={formRegularPrice}
                      onChange={(e) => setFormRegularPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ব্যাজ টেক্সট (Offer Badge)
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="e.g. 🔥 মেগা ডিসকাউন্ট"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* 5. Video URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রোডাক্ট ভিডিও URL (Optional Video Link)
                  </label>
                  <input
                    type="url"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* 6. Feature Bullets */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    ল্যান্ডিং পেইজ ফিচার পয়েন্টসমূহ (Key Features):
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {formFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="flex-1 font-semibold text-slate-700 truncate">
                          {feat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Feature */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="নতুন ফিচার পয়েন্ট লিখুন..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* 7. Schedule & Timing Section */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">
                          ক্যাম্পেইন শিডিউল ও টাইমিং (Campaign Schedule)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          নির্দিষ্ট তারিখ ও সময়ে অটো লাইভ ও মেয়াদ নির্ধারণ করুন
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormIsScheduled(!formIsScheduled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formIsScheduled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formIsScheduled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {formIsScheduled && (
                    <div className="space-y-3 pt-1 border-t border-blue-100">
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-600 mr-1">
                          কুইক শিডিউল:
                        </span>
                        <button
                          type="button"
                          onClick={handleSetLandingLiveNow}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-blue-50 cursor-pointer"
                        >
                          এখনই লাইভ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetLandingDuration(1)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-blue-50 cursor-pointer"
                        >
                          +২৪ ঘণ্টা
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetLandingDuration(3)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-blue-50 cursor-pointer"
                        >
                          +৩ দিন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetLandingDuration(7)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-blue-50 cursor-pointer"
                        >
                          +৭ দিন
                        </button>
                      </div>

                      {/* Start and End Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                          <label className="block font-bold text-slate-800 text-[11px] flex items-center justify-between">
                            <span>ক্যাম্পেইন শুরুর সময় (Start)</span>
                            <span className="text-[10px] text-blue-600 font-extrabold">Active From</span>
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="date"
                              value={formStartDate}
                              onChange={(e) => setFormStartDate(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                            />
                            <input
                              type="time"
                              value={formStartTime}
                              onChange={(e) => setFormStartTime(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                          <label className="block font-bold text-slate-800 text-[11px] flex items-center justify-between">
                            <span>ক্যাম্পেইন শেষের সময় (End)</span>
                            <span className="text-[10px] text-rose-600 font-extrabold">Expires At</span>
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="date"
                              value={formEndDate}
                              onChange={(e) => setFormEndDate(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                            />
                            <input
                              type="time"
                              value={formEndTime}
                              onChange={(e) => setFormEndTime(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500">
                        * নির্ধারিত শুরুর সময়ের আগে কাস্টমাররা একটি কাউন্টডাউন টাইমার দেখতে পাবে এবং সময় শেষ হওয়ার পর অফারটি স্বয়ংক্রিয়ভাবে সমাপ্ত হবে।
                      </p>
                    </div>
                  )}
                </div>

                {/* 8. Active Status Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      ক্যাম্পেইন স্ট্যাটাস (Status)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      অ্যাক্টিভ থাকলে কাস্টমার এই লিঙ্ক সরাসরি দেখতে পাবে
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formActive ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingCamp(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50"
                  >
                    বাতিল (Cancel)
                  </button>
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    type="submit"
                    className="font-bold text-xs"
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    {editingCamp ? 'আপডেট করুন (Save Changes)' : 'তৈরি করুন (Create)'}
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingCamp && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    ল্যান্ডিং পেইজ মুছে ফেলতে চান?
                  </h3>
                  <p className="text-xs text-slate-500">
                    এই অ্যাকশনটি স্থায়ী এবং বাতিল করা যাবে না।
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="font-black text-slate-900 block truncate">
                  {deletingCamp.title}
                </span>
                <span className="text-slate-500 text-[11px] block">
                  অফার মূল্য: ৳ {deletingCamp.offerPrice}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCamp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>মুছে ফেলুন (Confirm Delete)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
