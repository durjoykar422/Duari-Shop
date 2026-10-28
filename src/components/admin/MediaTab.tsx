import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  X,
  Eye,
  Download,
  Film,
  Image as ImageIcon,
  Play,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { MediaItem } from '../../types';
import { AnimatedButton } from '../AnimatedButton';

interface MediaTabProps {
  mediaList: MediaItem[];
  onAddMedia: (item: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  isPicker?: boolean;
  onSelectMedia?: (item: MediaItem) => void;
  selectedIds?: string[];
}

export const MediaTab: React.FC<MediaTabProps> = ({
  mediaList,
  onAddMedia,
  onDeleteMedia,
  isPicker = false,
  onSelectMedia,
  selectedIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'image' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [viewSize, setViewSize] = useState<'large' | 'small'>('large');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle local file uploads (multiple images and videos)
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let addedCount = 0;
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);

      if (!isVideo && !isImage) {
        showToast(`"${file.name}" ফর্মাট সমর্থিত নয় (Only images & videos allowed)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newItem: MediaItem = {
            id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: e.target.result as string,
            type: isVideo ? 'video' : 'image',
            mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
            size: file.size,
            date: new Date().toISOString().split('T')[0],
          };

          onAddMedia(newItem);
          addedCount++;
          if (addedCount === files.length) {
            showToast(`${addedCount} টি মিডিয়া ফাইল সফলভাবে আপলোড হয়েছে!`);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleCopy = (item: MediaItem) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      showToast('URL copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    const item = mediaList.find((m) => m.id === deletingId);
    onDeleteMedia(deletingId);
    setDeletingId(null);
    showToast(`"${item?.name || 'ফাইল'}" সফলভাবে ডিলিট করা হয়েছে`);
  };

  // Filter and sort items
  const filteredList = mediaList
    .filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFormat =
        formatFilter === 'all'
          ? true
          : formatFilter === 'video'
          ? item.type === 'video'
          : item.type !== 'video';
      return matchSearch && matchFormat;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'oldest') return (a.date || '').localeCompare(b.date || '');
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return 0;
    });

  // Calculate stats
  const totalItems = mediaList.length;
  const totalSizeBytes = mediaList.reduce((acc, curr) => acc + (curr.size || 350000), 0);
  const totalMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const videoCount = mediaList.filter((m) => m.type === 'video').length;
  const imageCount = totalItems - videoCount;

  const itemToDelete = mediaList.find((m) => m.id === deletingId);

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

      {/* Header matching Screenshot 2 */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Media Gallery
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {imageCount} images {videoCount > 0 ? `· ${videoCount} videos` : ''} · {totalMB} MB used · {mediaList.length} items total
        </p>
      </div>

      {/* Hidden File Input for Device Upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,video/*,.mp4,.mov,.webm"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Big Drag and Drop Zone matching Screenshot 2 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? 'border-purple-600 bg-purple-100/50 scale-[1.01]'
            : 'border-purple-300/80 bg-purple-50/20 hover:border-purple-500 hover:bg-purple-50/40'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3.5 max-w-xl mx-auto">
          {/* Cloud Upload Icon in purple circle */}
          <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Drop images or videos here or <span className="text-purple-700 underline font-extrabold">click to select</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You can select several images and videos at once from your local device
            </p>
          </div>

          {/* Badges / Guidelines Pills matching Screenshot 2 */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <span className="text-purple-600 font-bold">📄</span> JPG, JPEG, PNG, WEBP, MP4, WEBM
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <span className="text-purple-600 font-bold">💾</span> Max 50 MB per file
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <span className="text-purple-600 font-bold">✓</span> 1200 × 1200 px for products
            </span>
          </div>

          <div className="text-[11px] text-purple-700 font-bold flex items-center gap-1 hover:underline cursor-pointer">
            <Info className="w-3.5 h-3.5" />
            <span>Image & video guidelines</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar matching Screenshot 2 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search by file name */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name"
              className="w-full pl-3 pr-9 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Formats dropdown */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All formats</option>
            <option value="image">Images only</option>
            <option value="video">Videos only</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">File size</option>
          </select>
        </div>

        {/* Right: Showing count & View Size switcher */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{filteredList.length}</strong> of {totalItems}
          </span>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewSize('large')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewSize === 'large'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Large
            </button>
            <button
              onClick={() => setViewSize('small')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewSize === 'small'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Small
            </button>
          </div>
        </div>
      </div>

      {/* Media Items Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">কোনো মিডিয়া ফাইল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">
              আপনার লোকাল ডিভাইস থেকে ছবি বা ভিডিও আপলোড করতে উপরের বক্সে ক্লিক করুন।
            </p>
          </div>
          <AnimatedButton
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<UploadCloud className="w-4 h-4" />}
            className="!bg-purple-700 hover:!bg-purple-800 text-xs font-bold"
          >
            ফাইল আপলোড করুন (Upload from Device)
          </AnimatedButton>
        </div>
      ) : (
        <div
          className={
            viewSize === 'large'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5'
          }
        >
          {filteredList.map((item) => {
            const isVideo = item.type === 'video';
            const isSelected = selectedIds.includes(item.id);
            const sizeStr = item.size
              ? item.size > 1024 * 1024
                ? `${(item.size / (1024 * 1024)).toFixed(1)} MB`
                : `${Math.round(item.size / 1024)} KB`
              : 'Photo';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isPicker && onSelectMedia) {
                    onSelectMedia(item);
                  }
                }}
                className={`group relative bg-white rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                  isPicker ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-600 shadow-md'
                    : 'border-slate-200/90 hover:border-purple-400 hover:shadow-md'
                }`}
              >
                {/* Media Preview Box */}
                <div
                  className={`bg-slate-900 relative overflow-hidden flex items-center justify-center ${
                    viewSize === 'large' ? 'aspect-square' : 'aspect-square'
                  }`}
                >
                  {isVideo ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover opacity-85"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Film className="w-2.5 h-2.5" />
                        Video
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  )}

                  {/* Badge & Quick Action overlay */}
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold backdrop-blur-xs">
                    {sizeStr}
                  </span>

                  {/* Hover Buttons */}
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white hover:text-purple-700 shadow-xs transition-colors"
                      title="Preview Media"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item);
                      }}
                      className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white hover:text-purple-700 shadow-xs transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(item.id);
                      }}
                      className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-red-600 hover:text-white shadow-xs transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="p-2.5 space-y-1">
                  <h4
                    className="text-xs font-bold text-slate-800 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{item.date || 'Today'}</span>
                    <span className="uppercase text-purple-700 font-bold">
                      {isVideo ? 'MP4' : 'IMAGE'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Delete Confirmation Modal (NO window.confirm!) */}
      <AnimatePresence>
        {deletingId && (
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
                    মিডিয়া ফাইল ডিলিট করবেন?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to delete this media file?
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-800">
                <p className="font-semibold truncate">
                  "{itemToDelete?.name}" ফাইলটি স্থায়ীভাবে মিডিয়া গ্যালারি থেকে মুছে যাবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>হ্যাঁ, ডিলিট করুন (Yes, Delete)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Preview Modal for Image & Video */}
      <AnimatePresence>
        {previewItem && (
          <div
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-sm font-bold truncate max-w-md">
                    {previewItem.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {previewItem.type} file · {previewItem.date}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex items-center justify-center bg-black min-h-[350px] max-h-[70vh] overflow-hidden">
                {previewItem.type === 'video' ? (
                  <video
                    src={previewItem.url}
                    controls
                    autoPlay
                    className="max-h-[60vh] max-w-full rounded-xl"
                  />
                ) : (
                  <img
                    src={previewItem.url}
                    alt={previewItem.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-xl"
                  />
                )}
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Direct Local Device Asset
                </span>
                <div className="flex items-center gap-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(previewItem)}
                    className="!bg-slate-800 !text-white !border-slate-700 hover:!bg-slate-700 text-xs"
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Copy Link
                  </AnimatedButton>
                  <AnimatedButton
                    variant="primary"
                    size="sm"
                    onClick={() => setPreviewItem(null)}
                    className="!bg-purple-600 hover:!bg-purple-700 text-xs font-bold"
                  >
                    Close Preview
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
