import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Info,
  Calendar,
  Sparkles,
  Check,
  Tag,
  Copy,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  Timer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PromoCode } from '../../types';
import {
  getPromoCodeScheduleStatus,
  formatDisplayDateTime,
  ScheduleStatusType,
} from '../../utils/scheduleUtils';

interface PromoCodeTabProps {
  promoCodes: PromoCode[];
  onAddPromoCode: (promo: PromoCode) => void;
  onUpdatePromoCode: (promo: PromoCode) => void;
  onDeletePromoCode: (id: string) => void;
}

export const PromoCodeTab: React.FC<PromoCodeTabProps> = ({
  promoCodes,
  onAddPromoCode,
  onUpdatePromoCode,
  onDeletePromoCode,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<PromoCode | null>(null);

  // Form states
  const [codeName, setCodeName] = useState('');
  const [amountValue, setAmountValue] = useState<string>('');
  const [percentageValue, setPercentageValue] = useState<string>('');
  const [hasMaxDiscount, setHasMaxDiscount] = useState(false);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [hasMinPurchase, setHasMinPurchase] = useState(false);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>('');
  // Schedule states
  const [isScheduled, setIsScheduled] = useState(true);
  const [startDate, setStartDate] = useState<string>('2026-10-11');
  const [startTime, setStartTime] = useState<string>('00:00');
  const [expiryDate, setExpiryDate] = useState<string>('2026-10-18');
  const [expireTime, setExpireTime] = useState<string>('23:59');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Status Filter: all | live | scheduled | expired
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'scheduled' | 'expired'>('all');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Summary counts
  const stats = promoCodes.reduce(
    (acc, p) => {
      const st = getPromoCodeScheduleStatus(p).status;
      if (st === 'live') acc.live++;
      else if (st === 'scheduled') acc.scheduled++;
      else if (st === 'expired') acc.expired++;
      return acc;
    },
    { live: 0, scheduled: 0, expired: 0 }
  );

  const filteredPromoCodes = promoCodes.filter((p) => {
    if (statusFilter === 'all') return true;
    const st = getPromoCodeScheduleStatus(p).status;
    return st === statusFilter;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredPromoCodes.length / itemsPerPage) || 1;
  const currentItems = filteredPromoCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setCodeName('');
    setAmountValue('50');
    setPercentageValue('');
    setHasMaxDiscount(false);
    setMaxDiscountAmount('');
    setHasMinPurchase(false);
    setMinPurchaseAmount('');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentHour = String(today.getHours()).padStart(2, '0');
    const currentMin = String(today.getMinutes()).padStart(2, '0');
    setStartDate(todayStr);
    setStartTime(`${currentHour}:${currentMin}`);
    setIsScheduled(true);

    // Default expiry 1 week from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpiryDate(nextWeek.toISOString().split('T')[0]);
    setExpireTime('23:59');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setCodeName(promo.code);
    if (promo.discountType === 'amount') {
      setAmountValue(String(promo.discountValue));
      setPercentageValue('');
    } else {
      setPercentageValue(String(promo.discountValue));
      setAmountValue('');
    }
    setHasMaxDiscount(!!promo.maxDiscount);
    setMaxDiscountAmount(promo.maxDiscount ? String(promo.maxDiscount) : '');
    setHasMinPurchase(!!promo.minPurchase);
    setMinPurchaseAmount(promo.minPurchase ? String(promo.minPurchase) : '');

    setStartDate(promo.startDate || promo.createdAt || new Date().toISOString().split('T')[0]);
    setStartTime(promo.startTime || '00:00');
    setExpiryDate(promo.expireDate);
    setExpireTime(promo.expireTime || '23:59');
    setIsScheduled(promo.isScheduled !== undefined ? promo.isScheduled : true);
    setIsModalOpen(true);
  };

  // Quick Preset Handlers
  const handleSetLiveNow = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentHour = String(today.getHours()).padStart(2, '0');
    const currentMin = String(today.getMinutes()).padStart(2, '0');
    setStartDate(todayStr);
    setStartTime(`${currentHour}:${currentMin}`);
  };

  const handleSetPresetExpiry = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setExpiryDate(target.toISOString().split('T')[0]);
    setExpireTime('23:59');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeName.trim()) {
      alert('Please enter a Code Name');
      return;
    }

    const isPercentage = percentageValue.trim().length > 0 && Number(percentageValue) > 0;
    const discountVal = isPercentage ? Number(percentageValue) : Number(amountValue) || 0;

    if (discountVal <= 0) {
      alert('Please enter a valid discount Amount or Percentage');
      return;
    }

    const scheduleStartStr = `${startDate}T${startTime || '00:00'}`;
    const scheduleEndStr = `${expiryDate}T${expireTime || '23:59'}`;

    const payload: PromoCode = {
      id: editingPromo ? editingPromo.id : `promo-${Date.now()}`,
      code: codeName.trim(),
      discountType: isPercentage ? 'percentage' : 'amount',
      discountValue: discountVal,
      maxDiscount: hasMaxDiscount && maxDiscountAmount ? Number(maxDiscountAmount) : null,
      minPurchase: hasMinPurchase && minPurchaseAmount ? Number(minPurchaseAmount) : null,
      isScheduled,
      startDate,
      startTime: startTime || '00:00',
      scheduleStart: scheduleStartStr,
      expireDate: expiryDate || '2026-12-31',
      expireTime: expireTime || '23:59',
      scheduleEnd: scheduleEndStr,
      active: true,
      usageCount: editingPromo ? editingPromo.usageCount || 0 : 0,
      createdAt: editingPromo ? editingPromo.createdAt : new Date().toISOString().split('T')[0],
    };

    if (editingPromo) {
      onUpdatePromoCode(payload);
      showToast(`Promo code "${payload.code}" updated successfully!`);
    } else {
      onAddPromoCode(payload);
      showToast(`Promo code "${payload.code}" created successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <Check className="w-4 h-4 text-purple-600" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Top Header matching Screenshot 1 with Schedule Status Summary */}
      <div className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span>Promo Codes</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase">
                {promoCodes.length} Total
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {stats.live} Live
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
            <p className="text-xs text-slate-500 mt-1">
              Create and manage promotional discount coupons with live schedule start and expiration times.
            </p>
          </div>

          {/* Purple Button matching Screenshot 1 */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#6200ea] hover:bg-[#5200c7] active:bg-[#4300a3] text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Promo Code</span>
          </button>
        </div>

        {/* Schedule Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({promoCodes.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('live');
              setCurrentPage(1);
            }}
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
            onClick={() => {
              setStatusFilter('scheduled');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'scheduled'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            Scheduled ({stats.scheduled})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('expired');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Expired ({stats.expired})
          </button>
        </div>
      </div>

      {/* Promo Code Cards Grid matching Screenshot 1 */}
      {promoCodes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base text-slate-800">
            No Promo Codes Created Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ New Promo Code" above to create your first discount coupon for your storefront.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-[#6200ea] text-white text-xs font-bold hover:bg-[#5200c7] transition-all cursor-pointer"
          >
            + Create First Promo Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentItems.map((promo) => {
            const schedStatus = getPromoCodeScheduleStatus(promo);
            return (
              <div
                key={promo.id}
                className="w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200/80 flex flex-col group"
              >
                {/* Top Green Ticket Section (Matching Screenshot 1) */}
                <div className="bg-[#2bb274] p-4 text-white relative">
                  {/* Discount Headline & Action Icons */}
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-1">
                      {promo.discountType === 'amount'
                        ? `৳ ${promo.discountValue} Off •`
                        : `${promo.discountValue}% Off •`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(promo)}
                        title="Edit Promo Code"
                        className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      {/* Red Trash Delete Button (Matching Screenshot 1) */}
                      <button
                        onClick={() => setDeletingPromo(promo)}
                        title="Delete Promo Code"
                        className="p-1.5 rounded-lg border border-red-300/40 bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Dotted Divider 1 */}
                  <div className="border-t border-dashed border-white/40 my-2.5" />

                  {/* Min Purchase & Max Discount */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-white/90 block">
                        Min Purchase
                      </span>
                      <span className="font-semibold text-white">
                        {promo.minPurchase ? `৳ ${promo.minPurchase}` : '৳ n/a'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-white/90 block">
                        Max Discount
                      </span>
                      <span className="font-semibold text-white">
                        {promo.maxDiscount ? `৳ ${promo.maxDiscount}` : '৳ n/a'}
                      </span>
                    </div>
                  </div>

                  {/* Dotted Divider 2 */}
                  <div className="border-t border-dashed border-white/40 my-2.5" />

                  {/* Schedule & Expire Date Information */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/90">
                        Status
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          schedStatus.status === 'live'
                            ? 'bg-emerald-950/40 text-emerald-100 border border-emerald-300/40'
                            : schedStatus.status === 'scheduled'
                            ? 'bg-amber-950/40 text-amber-100 border border-amber-300/40'
                            : 'bg-rose-950/40 text-rose-100 border border-rose-300/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            schedStatus.status === 'live'
                              ? 'bg-emerald-300 animate-pulse'
                              : schedStatus.status === 'scheduled'
                              ? 'bg-amber-300'
                              : 'bg-rose-300'
                          }`}
                        />
                        <span>{schedStatus.label}</span>
                      </span>
                    </div>

                    {promo.startDate && (
                      <div>
                        <span className="text-[10px] font-bold text-white/80 block">
                          Start Time
                        </span>
                        <span className="font-semibold text-white text-[11px]">
                          {formatDisplayDateTime(promo.startDate, promo.startTime)}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-bold text-white/80 block">
                        Expire Time
                      </span>
                      <span
                        className={`font-semibold text-[11px] ${
                          schedStatus.status === 'expired' ? 'text-amber-200 line-through' : 'text-white'
                        }`}
                      >
                        {formatDisplayDateTime(promo.expireDate, promo.expireTime)}
                      </span>
                    </div>

                    {schedStatus.status === 'scheduled' && schedStatus.timeRemainingText && (
                      <div className="pt-1 text-[10px] text-amber-100 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-200" />
                        <span>শুরু হতে বাকি: {schedStatus.timeRemainingText}</span>
                      </div>
                    )}

                    {schedStatus.status === 'live' && schedStatus.timeRemainingText && (
                      <div className="pt-0.5 text-[10px] text-emerald-100 font-bold flex items-center gap-1">
                        <Timer className="w-3 h-3 text-emerald-200" />
                        <span>বাকি: {schedStatus.timeRemainingText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Perforation Sawtooth Pattern (Matching Screenshot 1) */}
                <div className="relative bg-[#2bb274] h-3 overflow-hidden select-none">
                  <div className="absolute inset-0 flex justify-between items-end">
                    {Array.from({ length: 18 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-2.5 h-2.5 bg-white rounded-t-xs"
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom White Section (Matching Screenshot 1) */}
                <div className="bg-white p-4 text-center border-t border-slate-100 flex-1 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-800 block">
                    Promo Code
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span className="font-mono font-black text-sm text-slate-900 tracking-wide select-all">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopy(promo.code)}
                      title="Copy code"
                      className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedCode === promo.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination matching Screenshot 1 */}
      {promoCodes.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing 1–{promoCodes.length} of {promoCodes.length}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="w-8 h-8 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 flex items-center justify-center shadow-2xs">
              {currentPage}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Promo Code Modal matching Screenshots 2, 3, 4 */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header with Title and Close X (Matching Screenshot 2) */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                {/* Code Name * (Matching Screenshot 2) */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-800">
                    Code Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={codeName}
                    onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                    placeholder="Promo Code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all uppercase"
                  />
                  <p className="text-[11px] text-slate-400">
                    Enter a unique promo code. This will help you identify it later.
                  </p>
                </div>

                {/* Discount Type (Amount/Percentage) (Matching Screenshot 2) */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">
                    Discount Type (Amount/Percentage)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={amountValue}
                      onChange={(e) => {
                        setAmountValue(e.target.value);
                        if (e.target.value) setPercentageValue('');
                      }}
                      placeholder="Amount"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                    />

                    <span className="text-xs font-semibold text-slate-500 px-1">
                      Or
                    </span>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percentageValue}
                      onChange={(e) => {
                        setPercentageValue(e.target.value);
                        if (e.target.value) setAmountValue('');
                      }}
                      placeholder="Percentage"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>

                {/* Toggles Row: Max Discount & Min Purchase (Matching Screenshots 2, 3, 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Max Discount Toggle */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasMaxDiscount}
                          onChange={(e) => setHasMaxDiscount(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6200ea]" />
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-800 text-xs">
                          Max Discount
                        </span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Apply the highest available discount on eligible purchases.
                    </p>
                  </div>

                  {/* Min Purchase Toggle */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasMinPurchase}
                          onChange={(e) => setHasMinPurchase(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6200ea]" />
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-800 text-xs">
                          Min Purchase
                        </span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Set a minimum purchase requirement for discounts to apply.
                    </p>
                  </div>
                </div>

                {/* Conditional Max Discount Input (Screenshot 4) */}
                {hasMaxDiscount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1 pt-1"
                  >
                    <label className="block font-semibold text-slate-800 text-xs">
                      Max Discount
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      placeholder="Type max discount amount (ex. ৳2000)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all text-xs"
                    />
                  </motion.div>
                )}

                {/* Conditional Min Purchase Input (Screenshot 4) */}
                {hasMinPurchase && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1 pt-1"
                  >
                    <label className="block font-semibold text-slate-800 text-xs">
                      Min Purchase
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minPurchaseAmount}
                      onChange={(e) => setMinPurchaseAmount(e.target.value)}
                      placeholder="Type min purchase amount (ex. ৳2000)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all text-xs"
                    />
                  </motion.div>
                )}

                {/* Schedule & Expiry Timing Section */}
                <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-700" />
                      <span className="font-extrabold text-slate-900 text-xs">
                        ক্যাম্পেইন শিডিউল ও মেয়াদের সময় (Schedule Timing)
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                      Live Schedule
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">
                      কুইক প্রিসেট:
                    </span>
                    <button
                      type="button"
                      onClick={handleSetLiveNow}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-purple-50 cursor-pointer"
                    >
                      এখনই শুরু (Live Now)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetExpiry(1)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-purple-50 cursor-pointer"
                    >
                      +২৪ ঘণ্টা
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetExpiry(7)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-purple-50 cursor-pointer"
                    >
                      +৭ দিন
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetExpiry(30)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 font-bold text-[11px] transition-all hover:bg-purple-50 cursor-pointer"
                    >
                      +৩০ দিন
                    </button>
                  </div>

                  {/* Grid of Start and Expire Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Start Date & Time */}
                    <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 text-[11px] flex items-center justify-between">
                        <span>শুরুর সময় (Schedule Start)</span>
                        <span className="text-[10px] text-purple-600 font-extrabold">Active From</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-purple-600 focus:outline-none"
                        />
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-purple-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Expire Date & Time */}
                    <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                      <label className="block font-bold text-slate-800 text-[11px] flex items-center justify-between">
                        <span>মেয়াদ শেষের সময় (Schedule Expire)</span>
                        <span className="text-[10px] text-rose-600 font-extrabold">Expires At</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="date"
                          required
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-purple-600 focus:outline-none"
                        />
                        <input
                          type="time"
                          value={expireTime}
                          onChange={(e) => setExpireTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-800 focus:border-purple-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    * শুরুর সময় বর্তমান সময়ের পরে হলে প্রোমো কোডটি স্বয়ংক্রিয়ভাবে 'Scheduled' মোডে থাকবে এবং নির্ধারিত সময়ে স্বয়ংক্রিয়ভাবে চালু হবে।
                  </p>
                </div>

                {/* Footer Buttons (Cancel & Create) matching Screenshots 2, 3, 4 */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-xl bg-[#6200ea] hover:bg-[#5200c7] active:bg-[#4300a3] text-white font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    {editingPromo ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Promo Code Confirmation Modal */}
      <AnimatePresence>
        {deletingPromo && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    প্রোমো কোড ডিলিট নিশ্চিতকরণ
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    আপনি কি নিশ্চিত যে আপনি এই প্রোমো কোডটি ডিলিট করতে চান?
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-800">
                <p className="font-bold font-mono text-sm text-red-900">
                  {deletingPromo.code} ({deletingPromo.discountType === 'amount' ? `৳${deletingPromo.discountValue} Off` : `${deletingPromo.discountValue}% Off`})
                </p>
                <p className="mt-1 text-slate-600">
                  ডিলিট করলে গ্রাহকরা চেকআউটে আর এই কোডটি প্রয়োগ করে ডিসকাউন্ট পাবেন না এবং এটি স্থায়ীভাবে মুছে যাবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPromo(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeletePromoCode(deletingPromo.id);
                    showToast(`প্রোমো কোড "${deletingPromo.code}" সফলভাবে ডিলিট করা হয়েছে!`);
                    setDeletingPromo(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ডিলিট করুন (Delete Permanently)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
