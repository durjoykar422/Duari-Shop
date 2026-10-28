import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Sparkles,
  Table as TableIcon,
  Package,
  Eye,
  Edit3,
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw,
  Copy,
  Info,
  Check,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  Smartphone,
  Shirt,
  Watch,
  Smile,
  X,
  Search,
} from 'lucide-react';
import { ProductDescriptionView } from '../ProductDescriptionView';

interface ProductDescriptionEditorProps {
  value: string;
  onChange: (val: string) => void;
  lang?: 'en' | 'bn';
}

export const ProductDescriptionEditor: React.FC<ProductDescriptionEditorProps> = ({
  value,
  onChange,
  lang = 'bn',
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('editor');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<'digital' | 'tshirt' | 'watch' | 'deals' | 'all'>('digital');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Categorized Rich Emojis tailored for Digital Products, T-Shirts, Watches, and Offers
  const EMOJI_CATEGORIES = {
    digital: {
      name: lang === 'bn' ? '📱 ডিজিটাল প্রোডাক্ট' : '📱 Digital & Gadgets',
      icon: Smartphone,
      emojis: [
        '📱', '💻', '🖥️', '⌚', '🎧', '🔌', '🔋', '📷', '🎮', '⌨️',
        '🖱️', '🔊', '🖨️', '💾', '📡', '💡', '🎙️', '📺', '🕹️', '🤖',
        '⚡', '🌐', '📶', '💿', '📸', '📽️', '⚙️', '📲', '🖲️', '🎛️',
        '🔦', '📻', '📟', '🛸', '🛰️', '🔍'
      ],
    },
    tshirt: {
      name: lang === 'bn' ? '👕 টি-শার্ট ও ফ্যাশন' : '👕 T-Shirts & Fashion',
      icon: Shirt,
      emojis: [
        '👕', '👔', '👗', '🧥', '👖', '👟', '🧢', '🧦', '🧣', '🕶️',
        '👜', '🎒', '🥾', '🧵', '🪡', '🏷️', '👑', '💎', '🎽', '🩳',
        '👘', '👠', '👢', '🎨', '✨', '🌟', '🥼', '🩱', '🥻', '👛',
        '🧳', '🩰', '🦺', '🩴', '🩲', '🧺'
      ],
    },
    watch: {
      name: lang === 'bn' ? '⌚ ওয়াচ ও ঘড়ি' : '⌚ Watches & Clocks',
      icon: Watch,
      emojis: [
        '⌚', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '💍', '📿', '🪙',
        '🧲', '🔋', '💧', '🏃‍♂️', '🏊‍♂️', '💓', '❤️', '📊', '🛡️', '💎',
        '🏅', '🔮', '🧗‍♂️', '🚴‍♂️', '🧭', '🌟', '⚙️', '🥇', '🥈', '🥉'
      ],
    },
    deals: {
      name: lang === 'bn' ? '🔥 অফার ও ডেলিভারি' : '🔥 Offers & Delivery',
      icon: Flame,
      emojis: [
        '🔥', '⚡', '✨', '💯', '⭐', '🎁', '📦', '🚚', '🛡️', '✅',
        '📌', '🎯', '💥', '৳', '💰', '🛒', '🛍️', '🚨', '🏆', '🎉',
        '🌟', '📢', '🏷️', '👍', '👌', '❤️‍🔥', '🤝', '🔒', '🎫', '🚀'
      ],
    },
  };

  // Quick toolbar emojis (instant 1-click access)
  const QUICK_TOOLBAR_EMOJIS = [
    '👕', '⌚', '📱', '💻', '🎧', '🔥', '⚡', '💯', '📦', '🚚', '🛡️', '⭐', '✅', '🎁', '💥', '৳', '🎯', '📌'
  ];

  // Smart Heading Formatter: toggles or sets H1, H2, or H3 for the current line
  const applyHeading = (level: 1 | 2 | 3) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the beginning and end of the current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;

    const currentLine = text.substring(lineStart, lineEnd);
    const headingPrefix = '#'.repeat(level) + ' ';

    let newLine = currentLine;
    const headingMatch = currentLine.match(/^(#{1,6})\s*(.*)$/);

    if (headingMatch) {
      const currentLevel = headingMatch[1].length;
      const lineBody = headingMatch[2];
      if (currentLevel === level) {
        // Toggle off - return to regular text
        newLine = lineBody;
      } else {
        // Change heading level
        newLine = headingPrefix + lineBody;
      }
    } else {
      if (!currentLine.trim()) {
        const placeholder =
          level === 1
            ? 'বড় শিরোনাম (Main Heading)'
            : level === 2
            ? 'বিভাগ শিরোনাম (Section Heading)'
            : 'উপ-শিরোনাম (Sub Heading)';
        newLine = headingPrefix + placeholder;
      } else {
        newLine = headingPrefix + currentLine;
      }
    }

    const newValue = text.substring(0, lineStart) + newLine + text.substring(lineEnd);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = lineStart + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Smart Bold Toggle: wraps/unwraps selection with **
  const toggleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = text.substring(start, end);
      // Case A: selection itself is wrapped in **
      if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
        const unwrapped = selected.slice(2, -2);
        const nextVal = text.substring(0, start) + unwrapped + text.substring(end);
        onChange(nextVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + unwrapped.length);
        }, 10);
        return;
      }
      // Case B: surrounding characters are **
      if (start >= 2 && text.substring(start - 2, start) === '**' && text.substring(end, end + 2) === '**') {
        const nextVal = text.substring(0, start - 2) + selected + text.substring(end + 2);
        onChange(nextVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start - 2, end - 2);
        }, 10);
        return;
      }
      // Otherwise wrap with **
      const wrapped = `**${selected}**`;
      const nextVal = text.substring(0, start) + wrapped + text.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
      }, 10);
    } else {
      // No text selected: check if inside empty ****
      if (start >= 2 && text.substring(start - 2, start) === '**' && text.substring(start, start + 2) === '**') {
        const nextVal = text.substring(0, start - 2) + text.substring(start + 2);
        onChange(nextVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start - 2, start - 2);
        }, 10);
        return;
      }
      const placeholder = 'গাঢ় লেখা';
      const inserted = `**${placeholder}**`;
      const nextVal = text.substring(0, start) + inserted + text.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2 + placeholder.length);
      }, 10);
    }
  };

  // Smart Italic Toggle: wraps/unwraps selection with *
  const toggleItalic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = text.substring(start, end);
      // Case A: selection itself is wrapped in * (not **)
      if (selected.startsWith('*') && selected.endsWith('*') && !selected.startsWith('**') && selected.length >= 2) {
        const unwrapped = selected.slice(1, -1);
        const nextVal = text.substring(0, start) + unwrapped + text.substring(end);
        onChange(nextVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + unwrapped.length);
        }, 10);
        return;
      }
      // Case B: surrounding characters are *
      if (start >= 1 && text[start - 1] === '*' && text[start - 2] !== '*' && text[end] === '*' && text[end + 1] !== '*') {
        const nextVal = text.substring(0, start - 1) + selected + text.substring(end + 1);
        onChange(nextVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start - 1, end - 1);
        }, 10);
        return;
      }
      // Otherwise wrap with *
      const wrapped = `*${selected}*`;
      const nextVal = text.substring(0, start) + wrapped + text.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, end + 1);
      }, 10);
    } else {
      // No text selected: check if inside empty **
      if (start >= 1 && text[start - 1] === '*' && text[start] === '*' && text[start - 2] !== '*' && text[start + 1] !== '*') {
        const nextVal = text.substring(0, start - 1) + text.substring(start + 1);
        onChange(nextVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start - 1, start - 1);
        }, 10);
        return;
      }
      const placeholder = 'বাঁকা লেখা';
      const inserted = `*${placeholder}*`;
      const nextVal = text.substring(0, start) + inserted + text.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1 + placeholder.length);
      }, 10);
    }
  };

  // Smart Strikethrough Toggle: wraps/unwraps with ~~
  const toggleStrike = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = text.substring(start, end);
      if (selected.startsWith('~~') && selected.endsWith('~~') && selected.length >= 4) {
        const unwrapped = selected.slice(2, -2);
        const nextVal = text.substring(0, start) + unwrapped + text.substring(end);
        onChange(nextVal);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + unwrapped.length);
        }, 10);
        return;
      }
      const wrapped = `~~${selected}~~`;
      const nextVal = text.substring(0, start) + wrapped + text.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
      }, 10);
    } else {
      const placeholder = 'কাটা লেখা';
      const inserted = `~~${placeholder}~~`;
      const nextVal = text.substring(0, start) + inserted + text.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2 + placeholder.length);
      }, 10);
    }
  };

  // Helper to insert a block or list template
  const insertBlock = (blockText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value ? `${value}\n\n${blockText}` : blockText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const needsLeadingNewline = start > 0 && value[start - 1] !== '\n';
    const insertion = (needsLeadingNewline ? '\n\n' : '') + blockText + '\n';

    const newValue = value.substring(0, start) + insertion + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Insert Emoji at cursor position
  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + emoji + ' ');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const insertion = emoji + ' ';

    const newValue = value.substring(0, start) + insertion + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Copy description to clipboard
  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Professional E-Commerce Templates
  const TEMPLATES = [
    {
      id: 'ecommerce-complete',
      name: lang === 'bn' ? '🛍️ অল-ইন-ওয়ান প্রফেশনাল ই-কমার্স' : '🛍️ All-in-One Professional E-Commerce',
      desc: lang === 'bn' ? 'মূল পরিচিতি, ফিচার লিস্ট, স্পেসিফিকেশন টেবিল, প্যাকেজ ও ওয়ারেন্টি' : 'Highlights, features, specs table, box contents, & warranty',
      template: `## 🌟 পণ্যের মূল পরিচিতি ও বিশেষত্ব
এই প্রিমিয়াম কোয়ালিটি পণ্যটি আপনার দৈনন্দিন ব্যবহারে আনবে সর্বোচ্চ স্বাচ্ছন্দ্য ও স্টাইল। দীর্ঘস্থায়ী টেকসই উপকরণ ও আধুনিক ডিজাইনের সমন্বয়ে তৈরি।

## ✨ মূল আকর্ষণ ও সেরা ফিচারসমূহ:
✓ ১০০% প্রিমিয়াম ও অরিজিনাল কোয়ালিটি নিশ্চিত
✓ অত্যন্ত আরামদায়ক ও টেকসই মেটেরিয়ালে প্রস্তুত
✓ স্মার্ট ও এলিগ্যান্ট আকর্ষণীয় লুক
✓ দীর্ঘস্থায়ী ব্যবহারের নিশ্চয়তা
✓ সহজে পরিষ্কার ও যত্ন নেওয়ার সুবিধা

## 📋 টেকনিক্যাল স্পেসিফিকেশন
| বৈশিষ্ট্য | বিবরণ |
| --- | --- |
| ব্র্যান্ড | প্রিমিয়াম কালেকশন |
| কোয়ালিটি গ্রেড | এ গ্রেড (Original) |
| ম্যাটেরিয়াল / ফেব্রিক | প্রিমিয়াম কোয়ালিটি |
| তৈরি | বাংলাদেশ |
| ওয়ারেন্টি | ৭ দিনের রিপ্লেসমেন্ট সুবিধা |

## 📦 প্যাকেজের ভেতর যা যা পাচ্ছেন:
✓ ১টি প্রিমিয়াম পণ্য
✓ আকর্ষণীয় সেফটি প্যাকেজিং
✓ অফিশিয়াল কোয়ালিটি চেক ও ইনভয়েস

## 🛡️ আমাদের বিশেষ গ্যারান্টি:
> 📌 পণ্য হাতে পেয়ে চেক করে পেমেন্ট করার সম্পূর্ণ সুবিধা (Cash on Delivery)। কোনো সমস্যা থাকলে সাথে সাথে পরিবর্তনের সুযোগ রয়েছে।`,
    },
    {
      id: 'smartwatch',
      name: lang === 'bn' ? '⌚ স্মার্ট ওয়াচ ও ফিটনেস ট্র্যাকার' : '⌚ Smart Watch & Fitness Tracker',
      desc: lang === 'bn' ? 'AMOLED ডিসপ্লে, কলিং, হেলথ ট্র্যাকিং, ব্যাটারি ও ওয়াটারপ্রুফ রেটিং' : 'AMOLED display, calling, health sensor, battery & IP68',
      template: `## ⌚ প্রিমিয়াম স্মার্ট ওয়াচ ও অ্যাক্টিভ লাইফস্টাইল ট্র্যাকার
আধুনিক স্মার্ট জীবনযাত্রার জন্য স্টাইলিশ ডিজাইন ও অত্যাধুনিক টেকনোলজির পারফেক্ট কম্বিনেশন। যেকোনো স্মার্টফোনের সাথে দ্রুত ও সহজে কানেক্টেড থাকুন।

## ⚡ মূল আকর্ষণীয় ফিচারসমূহ:
✓ ফুল টাচ এইচডি AMOLED ডিসপ্লে - রোদেও স্পষ্ট দেখা যায়
✓ ব্লুটুথ কলিং ও রিয়েল-টাইম স্মার্ট নোটিফিকেশন অ্যালার্ট
✓ ২৪ ঘণ্টা হার্টরেট, SpO2 ও স্লিপ মনিটরিং হেলথ ট্র্যাকার
✓ মাল্টিপল স্পোর্টস মোড ও অ্যাক্টিভিটি ট্র্যাকিং
✓ IP68 ওয়াটার ও ডাস্ট রেজিস্ট্যান্ট - বৃষ্টি বা ঘামে কোনো ক্ষতি হবে না
✓ মেটালিক অ্যালয় বডি ও আরামদায়ক প্রিমিয়াম সিলিকন স্ট্র্যাপ

## 📋 টেকনিক্যাল স্পেসিফিকেশন:
| ফিচার | স্পেসিফিকেশন |
| --- | --- |
| ডিসপ্লে | ১.৪ ইঞ্চি HD AMOLED Curved Screen |
| ব্যাটারি ব্যাকআপ | একটানা ৫-৭ দিন সাধারণ ব্যবহারে |
| চার্জিং টাইম | মাত্র ৬০ মিনিটে ম্যাগনেটিক ফাস্ট চার্জ |
| কানেক্টিভিটি | Bluetooth 5.3 (Android ও iOS সাপোর্ট) |
| ওয়াটার রেজিস্ট্যান্স | IP68 Waterproof |
| ওয়ারেন্টি | ১ বছর অফিসিয়াল সার্ভিস ওয়ারেন্টি |

## 📦 বক্সের ভেতরে যা যা থাকছে:
✓ ১ x স্মার্ট ওয়াচ
✓ ১ x প্রিমিয়াম ম্যাগনেটিক চার্জিং কেবল
✓ ১ x অতিরিক্ত এক্সক্লুসিভ স্ট্র্যাপ (Free Gift)
✓ ১ x ইউজার গাইড ও ওয়ারেন্টি কার্ড

> 🔥 অফার চলাকালীন অর্ডার করলেই পাচ্ছেন বিশেষ ছাড় এবং ফ্রি হোম ডেলিভারি!`,
    },
    {
      id: 'apparel-fashion',
      name: lang === 'bn' ? '👕 ফ্যাশন, টি-শার্ট ও হুডি' : '👕 Fashion, T-Shirt & Hoodies',
      desc: lang === 'bn' ? 'ফেব্রিক জিএসএম, কম্ফোর্ট, সাইজ গাইড ও ওয়াশ ইন্সট্রাকশন' : 'Fabric GSM, fit, size guide, & wash care',
      template: `## 👕 প্রিমিয়াম স্টাইল ও কম্ফোর্ট টি-শার্ট কালেকশন
স্মার্ট আউটলুক ও সর্বোচ্চ আরামের জন্য আমাদের এই স্পেশাল কালেকশন। ১০০% প্রিমিয়াম সুতি কাপড়ে তৈরি হওয়ায় এটি সারা দিন পরে থাকার জন্য নিখুঁত।

## ✨ ফেব্রিক ও কোয়ালিটি ফিচার:
✓ ফেব্রিক: ১০০% কম্বড কটন (Combed Cotton)
✓ জিএসএম (GSM): ১৮০-১৯০ প্রিমিয়াম থিকনেস
✓ প্রি-শ্রিঙ্কড (Pre-Shrunk): ধোয়ার পর ছোট বা ঢিলে হবে না
✓ প্রিন্ট: হাই-ডেফিনিশন ডিউরেবল রাবার প্রিন্ট (দীর্ঘস্থায়ী)
✓ ড্রপ শোল্ডার ও স্টাইলিশ রেগুলার ফিট
✓ নিখুঁত সেলাই ও আরামদায়ক ফিনিশিং

## 📋 সাইজ চার্ট (Size Guide):
| সাইজ | বুক (Chest) | লম্বা (Length) |
| --- | --- | --- |
| M | ৩৮ ইঞ্চি | ২৭ ইঞ্চি |
| L | ৪০ ইঞ্চি | ২৮ ইঞ্চি |
| XL | ৪২ ইঞ্চি | ২৯ ইঞ্চি |
| XXL | ৪৪ ইঞ্চি | ৩০ ইঞ্চি |

## 🧼 ওয়াশ ও কেয়ার ইন্সট্রাকশন:
- নরমাল ওয়াটার বা হালকা ঠান্ডা পানিতে ওয়াশ করুন
- সরাসরি প্রিন্টের ওপর অতিরিক্ত গরম আয়রন পরিহার করুন
- ছায়াযুক্ত স্থানে শুকানো ভালো`,
    },
    {
      id: 'gadget-tech',
      name: lang === 'bn' ? '📱 ডিজিটাল গ্যাজেট ও ইলেকট্রনিক্স' : '📱 Digital Gadgets & Electronics',
      desc: lang === 'bn' ? 'ব্যাটারি, কানেক্টিভিটি, সেন্সর ও টেক স্পেক্স' : 'Battery, connectivity, sensors & tech specs',
      template: `## 📱 স্মার্ট পারফরম্যান্স ও আধুনিক প্রযুক্তি
দৈনন্দিন লাইফস্টাইলকে আরো সহজ ও গতিশীল করতে নিয়ে আসলো এই হাই-পারফরম্যান্স ডিভাইস।

## ✨ সেরা ফিচারসমূহ:
✓ পাওয়ারফুল প্রসেসিং ও আল্ট্রা-ফাস্ট রেসপন্স
✓ দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ ও ফাস্ট চার্জিং সুবিধা
✓ ক্রিস্টাল ক্লিয়ার অডিও / ডিসপ্লে আউটপুট
✓ স্লিম ও লাইটওয়েট এরগনোমিক বডি ডিজাইন
✓ ওয়াটার ও সোয়েট রেজিস্ট্যান্ট প্রটেকশন

## 📋 টেকনিক্যাল স্পেসিফিকেশন:
| ফিচার | স্পেসিফিকেশন |
| --- | --- |
| কানেক্টিভিটি | Bluetooth 5.3 / Type-C |
| ব্যাটারি লাইফ | একটানা ১২+ ঘণ্টা ব্যাকআপ |
| চার্জিং টাইম | মাত্র ৪৫ মিনিটে ফুল চার্জ |
| সাপোর্ট | Android, iOS, Windows, Mac |

## 📦 বক্সে যা থাকছে:
✓ ১ x স্মার্ট গ্যাজেট
✓ ১ x ফাস্ট চার্জিং Type-C কেবল
✓ ১ x ইউজার ম্যানুয়াল গাইড
✓ ১ x অফিসিয়াল ওয়ারেন্টি কার্ড`,
    },
    {
      id: 'offer-flash',
      name: lang === 'bn' ? '🔥 স্পেশাল অফার ও হট ডিল' : '🔥 Flash Sale & Special Offer',
      desc: lang === 'bn' ? 'সীমিত স্টক, ফ্রি গিফট ও ক্যাশ অন ডেলিভারি হাইলাইট' : 'Limited stock, free gifts & COD highlights',
      template: `## 🔥 সীমিত সময়ের স্পেশাল হট অফার!
স্টক থাকা পর্যন্ত সীমিত সময়ের জন্য আকর্ষণীয় ছাড়ে পাচ্ছেন আমাদের এই প্রিমিয়াম প্রোডাক্ট।

## 💥 অফারের বিশেষ সুবিধাসমূহ:
✓ নির্দিষ্ট সময়ের জন্য বিশেষ মেগা ডিসকাউন্ট
✓ সারাদেশে দ্রুততম হোম ডেলিভারি সুবিধা
✓ ক্যাশ অন ডেলিভারি - পণ্য দেখে মূল্য পরিশোধ করুন
✓ ১০০% অরিজিনাল ও ইনট্যাক্ট বক্স ডেলিভারি

> ⚡ দ্রুত অর্ডার করুন! আমাদের কাছে সীমিত পরিমাণ স্টক অবশিষ্ট রয়েছে।

## 📞 যে কোনো সহায়তায় আমাদের কাস্টমার কেয়ারে কল করুন:
আমাদের সাপোর্ট টিম সপ্তাহের ৭ দিনই ২৪ ঘণ্টা আপনার সহায়তায় প্রস্তুত।`,
    },
  ];

  // Stats
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.ceil(wordCount / 120);

  // Filtered emojis for modal
  const currentCategoryEmojis =
    emojiCategory === 'all'
      ? Array.from(new Set(Object.values(EMOJI_CATEGORIES).flatMap((cat) => cat.emojis)))
      : EMOJI_CATEGORIES[emojiCategory].emojis;

  return (
    <div className="product-description-editor space-y-2">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#5b32a3]" />
            <span>{lang === 'bn' ? 'পণ্যের বিবরণ (Product Description)' : 'Product Description'}</span>
          </label>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Markdown & Rich
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Preset Templates Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowTemplatesModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 text-[#5b32a3] border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs"
            title="Choose a ready-to-use template"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'bn' ? 'প্রস্তুত টেমপ্লেট' : 'Templates'}</span>
          </button>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'bn' ? 'এডিটর' : 'Editor'}</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview'}</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab('split')}
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                activeTab === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Split View"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[11px]">{lang === 'bn' ? 'পাশাপাশি' : 'Split'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:border-[#5b32a3] transition-all">
        {/* Rich Formatting Toolbar (Visible in editor and split mode) */}
        {activeTab !== 'preview' && (
          <div className="p-2 bg-slate-50 border-b border-slate-200 space-y-1.5 select-none">
            {/* Row 1: Headings, Bold, Italic, Strikethrough, Lists, Tables */}
            <div className="flex flex-wrap items-center gap-1 text-slate-700 text-xs">
              {/* Header 1 (Main Title) */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHeading(1)}
                className="px-2 py-1 rounded hover:bg-slate-200 active:bg-slate-300 font-black text-slate-900 flex items-center gap-0.5 border border-transparent hover:border-slate-300 transition-colors"
                title={lang === 'bn' ? 'বড় হেডার (H1 Title - ক্লিক করে টগল করুন)' : 'H1 Main Heading (Toggle)'}
              >
                <Heading1 className="w-3.5 h-3.5 text-[#5b32a3]" />
                <span className="text-[11px] font-black">H1</span>
              </button>

              {/* Header 2 (Section) */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHeading(2)}
                className="px-2 py-1 rounded hover:bg-slate-200 active:bg-slate-300 font-extrabold text-slate-800 flex items-center gap-0.5 border border-transparent hover:border-slate-300 transition-colors"
                title={lang === 'bn' ? 'মাঝারি হেডার (H2 Section - ক্লিক করে টগল করুন)' : 'H2 Section Heading (Toggle)'}
              >
                <Heading2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-extrabold">H2</span>
              </button>

              {/* Header 3 (Sub-heading) */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHeading(3)}
                className="px-2 py-1 rounded hover:bg-slate-200 active:bg-slate-300 font-bold text-slate-700 flex items-center gap-0.5 border border-transparent hover:border-slate-300 transition-colors"
                title={lang === 'bn' ? 'ছোট হেডার (H3 Sub - ক্লিক করে টগল করুন)' : 'H3 Sub-heading (Toggle)'}
              >
                <Heading3 className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px] font-bold">H3</span>
              </button>

              <span className="w-px h-4 bg-slate-300 mx-1" />

              {/* Bold (Bolt) */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleBold}
                className="p-1.5 px-2 rounded hover:bg-slate-200 active:bg-slate-300 font-black flex items-center gap-1 border border-transparent hover:border-slate-300 transition-colors"
                title={lang === 'bn' ? 'বোল্ড লেখা (**গাঢ় লেখা**)' : 'Bold (**text**)'}
              >
                <Bold className="w-3.5 h-3.5 text-slate-900 stroke-[3]" />
                <span className="text-[11px] font-extrabold">{lang === 'bn' ? 'বোল্ড' : 'B'}</span>
              </button>

              {/* Italic (Italy) */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleItalic}
                className="p-1.5 px-2 rounded hover:bg-slate-200 active:bg-slate-300 italic flex items-center gap-1 border border-transparent hover:border-slate-300 transition-colors"
                title={lang === 'bn' ? 'ইটালিক লেখা (*বাঁকা লেখা*)' : 'Italic (*text*)'}
              >
                <Italic className="w-3.5 h-3.5 text-slate-800" />
                <span className="text-[11px] font-bold italic">{lang === 'bn' ? 'ইটালিক' : 'I'}</span>
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleStrike}
                className="p-1.5 rounded hover:bg-slate-200 active:bg-slate-300"
                title={lang === 'bn' ? 'কাটা লেখা (~~text~~)' : 'Strikethrough (~~text~~)'}
              >
                <Strikethrough className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <span className="w-px h-4 bg-slate-300 mx-1" />

              {/* Lists: Checkmark, Bullet, Numbered */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  insertBlock(
                    '✓ ১০০% অরিজিনাল কোয়ালিটি পণ্য\n✓ প্রিমিয়াম টেকসই মেটেরিয়াল\n✓ ফাস্ট হোম ডেলিভারি সুবিধা'
                  )
                }
                className="px-2 py-1 rounded hover:bg-slate-200 text-emerald-700 font-bold flex items-center gap-1"
                title="Insert Checklist (✓ Features)"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px]">চেকলিস্ট</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlock('- প্রথম বিশেষত্ব\n- দ্বিতীয় বিশেষত্ব\n- তৃতীয় বিশেষত্ব')}
                className="p-1.5 rounded hover:bg-slate-200"
                title="Bullet List (- item)"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertBlock('1. প্রথম ধাপ\n2. দ্বিতীয় ধাপ\n3. তৃতীয় ধাপ')}
                className="p-1.5 rounded hover:bg-slate-200"
                title="Numbered List (1. item)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <span className="w-px h-4 bg-slate-300 mx-1" />

              {/* Callout box */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  insertBlock(
                    '> 📌 গুরুত্বপূর্ণ নোট: পণ্য রিসিভ করার সময় চেক করে মূল্য পরিশোধ করবেন।'
                  )
                }
                className="px-2 py-1 rounded hover:bg-slate-200 text-amber-700 font-bold flex items-center gap-1"
                title="Callout / Highlight Box (> Note)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">নোট বক্স</span>
              </button>

              {/* Specs Table */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  insertBlock(
                    '| বৈশিষ্ট্য | বিবরণ |\n| --- | --- |\n| ব্র্যান্ড | প্রিমিয়াম |\n| উপাদান | ১০০% কটন / অ্যালয় |\n| সাইজ / মডেল | রেগুলার ফিট |\n| ওয়ারেন্টি | ৭ দিন রিপ্লেসমেন্ট সুবিধা |'
                  )
                }
                className="px-2 py-1 rounded hover:bg-slate-200 text-blue-700 font-bold flex items-center gap-1"
                title="Insert Specs Table"
              >
                <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px]">টেবিল</span>
              </button>

              {/* In the Box */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  insertBlock(
                    '## 📦 প্যাকেজে যা যা থাকছে:\n✓ ১টি মূল পণ্য\n✓ ইউজার গাইড ও ক্যাশ মেমো'
                  )
                }
                className="px-2 py-1 rounded hover:bg-slate-200 text-indigo-700 font-bold flex items-center gap-1"
                title="Insert Box Contents"
              >
                <Package className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px]">বক্স প্যাক</span>
              </button>

              {/* Emoji Modal Trigger Button */}
              <div className="relative ml-auto">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-purple-100/80 hover:bg-purple-200 text-[#5b32a3] font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Smile className="w-3.5 h-3.5 text-[#5b32a3]" />
                  <span>{lang === 'bn' ? 'ইমোজি পিকার' : 'All Emojis'}</span>
                </button>
              </div>
            </div>

            {/* Row 2: One-Click Quick Emoji Bar (Digital Products, T-Shirts, Watches, Deals) */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 bg-white/70 rounded-lg border border-slate-200/80 scrollbar-none text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1 mr-1 flex items-center gap-1">
                <span>দ্রুত ইমোজি:</span>
              </span>

              {QUICK_TOOLBAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertEmoji(emoji)}
                  className="p-1 hover:bg-purple-50 hover:scale-125 active:scale-95 rounded text-sm transition-transform shrink-0 flex items-center justify-center min-w-[26px] min-h-[26px]"
                  title={`Insert ${emoji}`}
                >
                  {emoji}
                </button>
              ))}

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(true)}
                className="text-[11px] font-bold text-[#5b32a3] hover:underline px-2 py-0.5 shrink-0 ml-auto flex items-center gap-1"
              >
                <span>আরও...</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="relative">
          {/* TAB 1: Editor Only */}
          {activeTab === 'editor' && (
            <textarea
              ref={textareaRef}
              rows={10}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="পণ্যের সম্পূর্ণ বিবরণ, মূল ফিচার, স্পেসিফিকেশন এবং ওয়ারেন্টি তথ্য এখানে লিখুন (উপরে H1, H2, বোল্ড, ইটালিক, ডিজিটাল প্রোডাক্ট, টি-শার্ট ও ওয়াচ ইমোজি ব্যবহার করতে পারেন)..."
              className="w-full p-4 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none resize-y leading-relaxed font-sans min-h-[230px]"
            />
          )}

          {/* TAB 2: Live Website Preview Only */}
          {activeTab === 'preview' && (
            <div className="p-5 sm:p-7 bg-white min-h-[260px] max-h-[500px] overflow-y-auto">
              <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ওয়েবসাইটে ক্রেতারা যেভাবে দেখবে (Storefront Preview)</span>
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCopy}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <ProductDescriptionView content={value} lang={lang} mode="full" />
              </div>
            </div>
          )}

          {/* TAB 3: Split Screen (Editor on Left, Live Preview on Right) */}
          {activeTab === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[260px]">
              <div className="p-2">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  এডিটর (Markdown Editor)
                </div>
                <textarea
                  ref={textareaRef}
                  rows={10}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="এখানে লিখুন..."
                  className="w-full p-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed font-sans h-[240px]"
                />
              </div>

              <div className="p-3 bg-slate-50/40 max-h-[280px] overflow-y-auto">
                <div className="px-1 py-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>রিয়েল-টাইম প্রিভিউ</span>
                </div>
                <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <ProductDescriptionView content={value} lang={lang} mode="full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Character count, Word count, Tips */}
        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span>
              বর্ণ: <strong className="text-slate-700">{charCount}</strong>
            </span>
            <span>
              শব্দ: <strong className="text-slate-700">{wordCount}</strong>
            </span>
            <span>
              পড়ার সময়: ~<strong className="text-slate-700">{readTimeMin} মিনিট</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">
              💡 লেখা সিলেক্ট করে <strong>H1/H2</strong>, <strong>বোল্ড</strong>, <strong>ইটালিক</strong> বাটনে চাপ দিন
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Categorized Emojis Picker (Digital, T-Shirts, Watches, Deals) */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#5b32a3] text-white rounded-xl">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {lang === 'bn' ? 'ই-কমার্স ইমোজি কালেকশন' : 'E-Commerce Emoji Collection'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ডিজিটাল প্রোডাক্ট, টি-শার্ট, ঘড়ি ও হট অফারের জন্য আকর্ষণীয় ইমোজি
                  </p>
                </div>
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="p-2 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEmojiCategory('digital')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  emojiCategory === 'digital'
                    ? 'bg-[#5b32a3] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 ডিজিটাল</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEmojiCategory('tshirt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  emojiCategory === 'tshirt'
                    ? 'bg-[#5b32a3] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>👕 টি-শার্ট / পোশাক</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEmojiCategory('watch')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  emojiCategory === 'watch'
                    ? 'bg-[#5b32a3] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Watch className="w-3.5 h-3.5" />
                <span>⌚ ঘড়ি / ওয়াচ</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEmojiCategory('deals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  emojiCategory === 'deals'
                    ? 'bg-[#5b32a3] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>🔥 অফার / ব্যাজ</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEmojiCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  emojiCategory === 'all'
                    ? 'bg-[#5b32a3] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>সব (All)</span>
              </button>
            </div>

            {/* Emoji Grid */}
            <div className="p-4 overflow-y-auto max-h-[320px]">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {currentCategoryEmojis.map((emoji, index) => (
                  <button
                    key={`${emoji}-${index}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      insertEmoji(emoji);
                      // keep open or close - keep focused
                    }}
                    className="p-2.5 rounded-xl hover:bg-purple-50 hover:scale-125 active:scale-95 transition-all text-2xl flex items-center justify-center border border-slate-100 hover:border-purple-200"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                ইমোজিতে ক্লিক করলেই বিবরণীর কার্সরে বসে যাবে
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowEmojiPicker(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ready-to-Use Templates Picker */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>প্রস্তুত প্রফেশনাল ডেসক্রিপশন টেমপ্লেট নির্বাচন করুন</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  একটি টেমপ্লেট বেছে নিলে আপনার পণ্যের বিবরণ স্বয়ংক্রিয়ভাবে আকর্ষণীয় ও প্রফেশনাল ফরম্যাটে সাজিয়ে দেবে।
                </p>
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowTemplatesModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Template Cards List */}
            <div className="p-5 overflow-y-auto space-y-3.5">
              {TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#5b32a3] transition-colors">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-slate-500">{tpl.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onChange(tpl.template);
                        setShowTemplatesModal(false);
                        setActiveTab('preview');
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-[#5b32a3] text-white hover:bg-indigo-700 text-xs font-bold transition-all shadow-sm"
                    >
                      ব্যবহার করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
