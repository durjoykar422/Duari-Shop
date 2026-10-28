/**
 * Schedule & Timing Utilities for Landing Pages and Promo Codes
 */

export type ScheduleStatusType = 'live' | 'scheduled' | 'expired' | 'inactive';

export interface ScheduleStatusInfo {
  status: ScheduleStatusType;
  label: string;
  badgeClass: string;
  isAvailable: boolean;
  startMs: number | null;
  endMs: number | null;
  displayText: string;
  timeRemainingText?: string;
}

/**
 * Parse date and optional time into a unified millisecond timestamp
 */
export function parseScheduleTimestamp(
  dateStr?: string,
  timeStr?: string,
  isEndOfDay = false
): number | null {
  if (!dateStr || !dateStr.trim()) return null;

  try {
    const cleanDate = dateStr.trim();
    // If it's already an ISO string with T, e.g. 2026-10-12T14:30
    if (cleanDate.includes('T')) {
      const parsed = new Date(cleanDate).getTime();
      return isNaN(parsed) ? null : parsed;
    }

    const cleanTime = timeStr && timeStr.trim()
      ? timeStr.trim()
      : isEndOfDay ? '23:59:59' : '00:00:00';

    // Format: YYYY-MM-DDTHH:mm:ss
    const isoLike = `${cleanDate}T${cleanTime.length === 5 ? cleanTime + ':00' : cleanTime}`;
    const parsed = new Date(isoLike).getTime();
    if (!isNaN(parsed)) return parsed;

    // Fallback standard parse
    const fallback = new Date(`${cleanDate} ${cleanTime}`).getTime();
    return isNaN(fallback) ? null : fallback;
  } catch {
    return null;
  }
}

/**
 * Format a human-readable remaining time string (e.g. "2 days 4 hours" or "২ দিন ৪ ঘণ্টা")
 */
export function formatTimeDiff(diffMs: number, lang: 'bn' | 'en' = 'bn'): string {
  if (diffMs <= 0) {
    return lang === 'bn' ? 'সময় শেষ' : 'Time ended';
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remHours = hours % 24;
  const remMinutes = minutes % 60;
  const remSeconds = seconds % 60;

  if (lang === 'bn') {
    if (days > 0) {
      return `${days} দিন ${remHours} ঘণ্টা`;
    }
    if (hours > 0) {
      return `${hours} ঘণ্টা ${remMinutes} মিনিট`;
    }
    if (minutes > 0) {
      return `${minutes} মিনিট ${remSeconds} সেকেন্ড`;
    }
    return `${remSeconds} সেকেন্ড`;
  } else {
    if (days > 0) {
      return `${days}d ${remHours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${remMinutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remSeconds}s`;
    }
    return `${remSeconds}s`;
  }
}

/**
 * Format a readable date and time for display
 */
export function formatDisplayDateTime(
  dateStr?: string,
  timeStr?: string,
  lang: 'bn' | 'en' = 'bn'
): string {
  if (!dateStr) return '';
  const ts = parseScheduleTimestamp(dateStr, timeStr);
  if (!ts) return dateStr;

  const d = new Date(ts);
  const formattedDate = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (timeStr) {
    const formattedTime = d.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  }

  return formattedDate;
}

/**
 * Evaluate Promo Code Schedule Status
 */
export function getPromoCodeScheduleStatus(
  promo: {
    active?: boolean;
    startDate?: string;
    startTime?: string;
    scheduleStart?: string;
    expireDate?: string;
    expireTime?: string;
    scheduleEnd?: string;
  },
  lang: 'bn' | 'en' = 'bn'
): ScheduleStatusInfo {
  if (promo.active === false) {
    return {
      status: 'inactive',
      label: lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
      isAvailable: false,
      startMs: null,
      endMs: null,
      displayText: lang === 'bn' ? 'নিষ্ক্রিয় কোড' : 'Inactive code',
    };
  }

  const now = Date.now();

  const startMs = parseScheduleTimestamp(
    promo.scheduleStart || promo.startDate,
    promo.startTime,
    false
  );

  const endMs = parseScheduleTimestamp(
    promo.scheduleEnd || promo.expireDate,
    promo.expireTime,
    true
  );

  // 1. Check if scheduled for future
  if (startMs && now < startMs) {
    const diff = startMs - now;
    const diffText = formatTimeDiff(diff, lang);
    return {
      status: 'scheduled',
      label: lang === 'bn' ? 'শিডিউল করা (Upcoming)' : 'Scheduled',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      isAvailable: false,
      startMs,
      endMs,
      displayText: lang === 'bn' ? `শুরু হতে বাকি: ${diffText}` : `Starts in: ${diffText}`,
      timeRemainingText: diffText,
    };
  }

  // 2. Check if expired
  if (endMs && now > endMs) {
    return {
      status: 'expired',
      label: lang === 'bn' ? 'মেয়াদ শেষ (Expired)' : 'Expired',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      isAvailable: false,
      startMs,
      endMs,
      displayText: lang === 'bn' ? 'মেয়াদ উত্তীর্ণ' : 'Expired',
    };
  }

  // 3. Otherwise Active & Live
  let displayText = lang === 'bn' ? 'সক্রিয় ও কার্যকর' : 'Active & Live';
  let remainingText: string | undefined;

  if (endMs) {
    const diff = endMs - now;
    remainingText = formatTimeDiff(diff, lang);
    displayText = lang === 'bn' ? `বাকি: ${remainingText}` : `Ends in: ${remainingText}`;
  }

  return {
    status: 'live',
    label: lang === 'bn' ? 'Active & Live' : 'Active & Live',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    isAvailable: true,
    startMs,
    endMs,
    displayText,
    timeRemainingText: remainingText,
  };
}

/**
 * Evaluate Landing Page Schedule Status
 */
export function getLandingPageScheduleStatus(
  camp: {
    active: boolean;
    isScheduled?: boolean;
    startDate?: string;
    startTime?: string;
    scheduleStart?: string;
    endDate?: string;
    endTime?: string;
    scheduleEnd?: string;
  },
  lang: 'bn' | 'en' = 'bn'
): ScheduleStatusInfo {
  if (!camp.active) {
    return {
      status: 'inactive',
      label: lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
      isAvailable: false,
      startMs: null,
      endMs: null,
      displayText: lang === 'bn' ? 'অফলাইন' : 'Offline',
    };
  }

  const now = Date.now();

  const startMs = parseScheduleTimestamp(
    camp.scheduleStart || camp.startDate,
    camp.startTime,
    false
  );

  const endMs = parseScheduleTimestamp(
    camp.scheduleEnd || camp.endDate,
    camp.endTime,
    true
  );

  // 1. If scheduled and start is in future
  if (startMs && now < startMs) {
    const diff = startMs - now;
    const diffText = formatTimeDiff(diff, lang);
    return {
      status: 'scheduled',
      label: lang === 'bn' ? 'শিডিউল করা (Upcoming)' : 'Scheduled',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      isAvailable: false,
      startMs,
      endMs,
      displayText: lang === 'bn' ? `ক্যাম্পেইন শুরু: ${diffText} পর` : `Starts in: ${diffText}`,
      timeRemainingText: diffText,
    };
  }

  // 2. If end time is set and past
  if (endMs && now > endMs) {
    return {
      status: 'expired',
      label: lang === 'bn' ? 'মেয়াদ শেষ (Expired)' : 'Expired',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      isAvailable: false,
      startMs,
      endMs,
      displayText: lang === 'bn' ? 'ক্যাম্পেইনের মেয়াদ সমাপ্ত' : 'Campaign Ended',
    };
  }

  // 3. Active & Live
  let displayText = lang === 'bn' ? 'সক্রিয় ও লাইভ' : 'Active & Live';
  let remainingText: string | undefined;

  if (endMs) {
    const diff = endMs - now;
    remainingText = formatTimeDiff(diff, lang);
    displayText = lang === 'bn' ? `চলমান • বাকি: ${remainingText}` : `Live • Ends in: ${remainingText}`;
  }

  return {
    status: 'live',
    label: lang === 'bn' ? 'Active & Live' : 'Active & Live',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    isAvailable: true,
    startMs,
    endMs,
    displayText,
    timeRemainingText: remainingText,
  };
}
