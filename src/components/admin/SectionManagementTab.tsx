import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutTemplate,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  Sparkles,
  Flame,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  AlertTriangle,
  Grid3X3,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { HomeSection, Product } from '../../types';
import { AnimatedButton } from '../AnimatedButton';

interface SectionManagementTabProps {
  sections: HomeSection[];
  categories: string[];
  products: Product[];
  onAddSection: (section: HomeSection) => void;
  onUpdateSection: (section: HomeSection) => void;
  onDeleteSection: (sectionId: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const SectionManagementTab: React.FC<SectionManagementTabProps> = ({
  sections,
  categories,
  products,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onNavigateTab,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [banglaTitle, setBanglaTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [type, setType] = useState<'category' | 'deals' | 'featured' | 'all'>('category');
  const [category, setCategory] = useState(
    categories.find((c) => c !== 'All Categories') || 'Gaming & Gears'
  );
  const [layout, setLayout] = useState<'grid' | 'carousel'>('carousel');
  const [active, setActive] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenAdd = () => {
    setEditingSection(null);
    setTitle('');
    setBanglaTitle('');
    setSubtitle('');
    setBadge('');
    setType('category');
    setCategory(categories.find((c) => c !== 'All Categories') || 'Gaming & Gears');
    setLayout('carousel');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec: HomeSection) => {
    setEditingSection(sec);
    setTitle(sec.title);
    setBanglaTitle(sec.banglaTitle || '');
    setSubtitle(sec.subtitle || '');
    setBadge(sec.badge || '');
    setType(sec.type);
    setCategory(sec.category || categories.find((c) => c !== 'All Categories') || 'Gaming & Gears');
    setLayout(sec.layout);
    setActive(sec.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingSection) {
      const updated: HomeSection = {
        ...editingSection,
        title: title.trim(),
        banglaTitle: banglaTitle.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        type,
        category: type === 'category' ? category : undefined,
        layout,
        active,
      };
      onUpdateSection(updated);
      showToast('সেকশন আপডেট হয়েছে (Section updated successfully)');
    } else {
      const newSec: HomeSection = {
        id: `sec-${Date.now()}`,
        title: title.trim(),
        banglaTitle: banglaTitle.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        type,
        category: type === 'category' ? category : undefined,
        layout,
        active,
        order: sections.length + 1,
      };
      onAddSection(newSec);
      showToast('নতুন সেকশন তৈরি হয়েছে (New section added)');
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingSectionId) return;
    const target = sections.find((s) => s.id === deletingSectionId);
    onDeleteSection(deletingSectionId);
    setDeletingSectionId(null);
    showToast(`"${target?.title || 'সেকশন'}" সফলভাবে ডিলিট করা হয়েছে (Section deleted)`);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Reassign order
    copy.forEach((s, idx) => {
      s.order = idx + 1;
      onUpdateSection(s);
    });
  };

  const sectionToDelete = sections.find((s) => s.id === deletingSectionId);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <LayoutTemplate className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                হোমপেইজ সেকশন ম্যানেজার (Homepage Section Management)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                আপনার স্টোরের মূল পেজের সেকশন যোগ করুন, সাজান বা ডিলিট করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onNavigateTab && (
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('categories')}
              className="text-xs font-bold shrink-0"
              leftIcon={<Layers className="w-3.5 h-3.5" />}
            >
              ক্যাটাগরি সমূহ
            </AnimatedButton>
          )}

          <AnimatedButton
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold text-xs shrink-0"
          >
            নতুন সেকশন যোগ করুন (Add Section)
          </AnimatedButton>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">কোনো সেকশন নেই</h3>
              <p className="text-xs text-slate-500 mt-1">
                আপনার ওয়েবসাইটের হোমপেইজে নতুন সেকশন যোগ করতে উপরের বাটন চাপুন।
              </p>
            </div>
            <AnimatedButton
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              নতুন সেকশন তৈরি করুন
            </AnimatedButton>
          </div>
        ) : (
          sections.map((sec, index) => {
            // Count matching products
            let count = 0;
            if (sec.type === 'category') {
              count = products.filter((p) => p.category === sec.category).length;
            } else if (sec.type === 'deals') {
              count = products.filter((p) => (p.discountPercent || 0) > 0).length;
            } else if (sec.type === 'featured') {
              count = products.filter((p) => p.isFeatured).length;
            } else {
              count = products.length;
            }

            return (
              <motion.div
                key={sec.id}
                layout
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  sec.active
                    ? 'border-slate-200/90 hover:border-blue-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                {/* Left side Info */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1">
                  {/* Order & Reorder Controls */}
                  <div className="flex sm:flex-col items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-black text-slate-700 px-1">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {sec.title}
                      </h3>
                      {sec.banglaTitle && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          {sec.banglaTitle}
                        </span>
                      )}
                      {sec.badge && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                          {sec.badge}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          sec.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {sec.active ? 'সক্রিয় (Live)' : 'লুকানো (Hidden)'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {sec.subtitle || 'হোমপেইজে নির্ধারিত প্রোডাক্ট ডিসপ্লে সেকশন'}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                      <span>
                        ধরন:{' '}
                        <strong className="text-slate-700 capitalize">
                          {sec.type === 'category'
                            ? `ক্যাটাগরি (${sec.category})`
                            : sec.type === 'deals'
                            ? 'ধামাকা ডিল'
                            : sec.type === 'featured'
                            ? 'ফিচার্ড প্রোডাক্ট'
                            : 'সকল প্রোডাক্ট'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        লেআউট:{' '}
                        <strong className="text-slate-700 capitalize">
                          {sec.layout === 'carousel' ? 'স্লাইডার / Carousel' : 'গ্রিড (Grid)'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="text-blue-600 font-bold">
                        {count} টি প্রোডাক্ট
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Toggle Active */}
                  <button
                    onClick={() => {
                      onUpdateSection({ ...sec, active: !sec.active });
                      showToast(
                        sec.active
                          ? 'সেকশন হোমপেইজে লুকানো হয়েছে'
                          : 'সেকশন হোমপেইজে সক্রিয় করা হয়েছে'
                      );
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      sec.active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={sec.active ? 'Hide from homepage' : 'Show on homepage'}
                  >
                    {sec.active ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(sec)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    title="Edit Section"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button - Opens reliable in-app modal */}
                  <button
                    onClick={() => setDeletingSectionId(sec.id)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xs"
                    title="Delete Section (ডিলিট করুন)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* In-App Delete Confirmation Modal (NO window.confirm!) */}
      <AnimatePresence>
        {deletingSectionId && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    সেকশন ডিলিট করতে চান?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to delete this section?
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-800">
                <p className="font-semibold">
                  "{sectionToDelete?.title || 'এই সেকশনটি'}" ডিলিট করলে এটি সাথে সাথে আপনার হোমপেইজ থেকে মুছে যাবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingSectionId(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>হ্যাঁ, ডিলিট করুন (Yes, Delete)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Section Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-100 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingSection ? 'সেকশন সম্পাদনা করুন (Edit Section)' : 'নতুন সেকশন যোগ করুন (Add Section)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    হোমপেইজে প্রদর্শনের জন্য সেকশন সেটিংস কনফিগার করুন
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Title & Bangla Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সেকশন টাইটেল (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Smart Watches & Wearables"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      বাংলা টাইটেল (Bangla Title)
                    </label>
                    <input
                      type="text"
                      value={banglaTitle}
                      onChange={(e) => setBanglaTitle(e.target.value)}
                      placeholder="e.g. স্মার্ট ওয়াচ ও ওয়্যারেবলস"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Subtitle & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সাবটাইটেল / বর্ণনা (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. সেরা অফারে কিনুন অরিজিনাল গ্যাজেট"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ব্যাজ / ট্যাগ (Badge)
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. 🔥 HOT, ⚡ NEW, 50% OFF"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Section Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রোডাক্টের ধরন (Product Filter Type)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'category', label: 'নির্দিষ্ট ক্যাটাগরি' },
                      { key: 'deals', label: 'ধামাকা অফার (Deals)' },
                      { key: 'featured', label: 'ফিচার্ড প্রোডাক্ট' },
                      { key: 'all', label: 'সকল প্রোডাক্ট' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setType(item.key as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          type === item.key
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* If category selected */}
                {type === 'category' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ক্যাটাগরি সিলেক্ট করুন (Select Category)
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
                    >
                      {categories
                        .filter((c) => c !== 'All Categories')
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Layout Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রদর্শন স্টাইল (Layout Style)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLayout('carousel')}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        layout === 'carousel'
                          ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>হরাইজন্টাল স্লাইডার (Carousel)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLayout('grid')}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        layout === 'grid'
                          ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4 text-blue-600" />
                      <span>প্রোডাক্ট গ্রিড (4 Columns)</span>
                    </button>
                  </div>
                </div>

                {/* Active Switch */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="section-active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="section-active"
                    className="text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    এই সেকশনটি সাথে সাথে হোমপেইজে সক্রিয় রাখুন (Active on Storefront)
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    বাতিল (Cancel)
                  </button>
                  <AnimatedButton variant="primary" size="md" type="submit" className="font-bold text-xs">
                    {editingSection ? 'আপডেট করুন (Update)' : 'সেভ করুন (Save Section)'}
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
