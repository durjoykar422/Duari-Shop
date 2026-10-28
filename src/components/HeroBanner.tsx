import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Truck,
  Layers,
  Headphones,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BannerSlide, BannerLogoConfig } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface HeroBannerProps {
  onOrderNow: () => void;
  lang: 'en' | 'bn';
  banner?: BannerSlide;
  slides?: BannerSlide[];
  bannerLogo?: BannerLogoConfig;
  onNavigateSlide?: (link: string, slide: BannerSlide) => void;
}

const DEFAULT_SLIDES: BannerSlide[] = [];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOrderNow,
  lang,
  banner,
  slides = DEFAULT_SLIDES,
  bannerLogo,
  onNavigateSlide,
}) => {
  const activeSlides = slides.filter((s) => s.active);
  const displaySlides =
    activeSlides.length > 0
      ? activeSlides
      : banner && banner.active
      ? [banner]
      : [];

  if (displaySlides.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);

  const goToSlide = (newIndex: number) => {
    setPrevIndex(currentIndex);
    setCurrentIndex(newIndex);
  };

  // Auto-advance slides every 5.5 seconds smoothly without black flash
  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [displaySlides.length, currentIndex]);

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];
  const previousSlide = displaySlides[prevIndex] || currentSlide;
  const ctaText =
    currentSlide.ctaText ||
    (lang === 'bn' ? 'অর্ডার করুন এখনই' : 'ORDER NOW');

  const handleSlideClick = (slide: BannerSlide) => {
    if (slide.link) {
      if (onNavigateSlide) {
        onNavigateSlide(slide.link, slide);
        return;
      }
      if (slide.link.startsWith('http://') || slide.link.startsWith('https://')) {
        window.open(
          slide.link,
          slide.openInNewTab !== false ? '_blank' : '_self',
          'noopener,noreferrer'
        );
        return;
      }
      if (slide.link.startsWith('#')) {
        const el = document.getElementById(slide.link.replace('#', ''));
        el?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    onOrderNow();
  };

  // Animation variants for the banner logo
  const getLogoAnimation = (type?: string) => {
    switch (type) {
      case 'float':
        return {
          animate: { y: [0, -8, 0] },
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.08, 1] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'glow':
        return {
          animate: {
            filter: [
              'drop-shadow(0 0 4px rgba(59,130,246,0.5))',
              'drop-shadow(0 0 18px rgba(59,130,246,0.95))',
              'drop-shadow(0 0 4px rgba(59,130,246,0.5))',
            ],
          },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'bounce':
        return {
          animate: { y: [0, -10, 0] },
          transition: { duration: 1.4, repeat: Infinity, ease: 'easeOut' as const },
        };
      case 'wave':
        return {
          animate: { rotate: [-4, 4, -4] },
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
        };
      default:
        return {};
    }
  };

  const getPositionClass = (pos?: string) => {
    switch (pos) {
      case 'top-right':
        return 'top-3 right-3 sm:top-5 sm:right-6';
      case 'bottom-left':
        return 'bottom-16 left-4 sm:bottom-20 sm:left-8';
      case 'bottom-right':
        return 'bottom-14 right-4 sm:bottom-16 sm:right-8';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'top-left':
      default:
        return 'top-3 left-3 sm:top-5 sm:left-6';
    }
  };

  const getSizeClass = (size?: string) => {
    switch (size) {
      case 'sm':
        return 'max-h-10 sm:max-h-12';
      case 'lg':
        return 'max-h-20 sm:max-h-24';
      case 'xl':
        return 'max-h-24 sm:max-h-32';
      case 'md':
      default:
        return 'max-h-14 sm:max-h-16';
    }
  };

  // Active logo settings (from store settings or slide override)
  const activeLogo = currentSlide.logo
    ? {
        url: currentSlide.logo,
        active: true,
        animation: 'float' as const,
        position: 'top-left' as const,
        size: 'md' as const,
      }
    : bannerLogo?.active && bannerLogo.url
    ? bannerLogo
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/90 mb-8 bg-white group">
      {/* 
        Official Duari Shop Hero Banner Carousel 
        Zero-Black Guarantee:
        1. Container is pure white/light neutral (never black).
        2. Permanent base underlay image displays the previous slide at 100% opacity.
        3. Active slide fades in seamlessly on top without revealing any gaps.
        4. No dark black overlays.
      */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] max-h-[460px] overflow-hidden bg-white select-none">
        {/* Base Layer: Displays previous slide at full opacity so background NEVER flashes black */}
        <div className="absolute inset-0 w-full h-full bg-white">
          <img
            src={previousSlide.image}
            alt=""
            referrerPolicy="no-referrer"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Active Slide: Cross-fades smoothly on top */}
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide.id || currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            onClick={() => handleSlideClick(currentSlide)}
            className={`absolute inset-0 w-full h-full z-1 ${
              currentSlide.link ? 'cursor-pointer' : ''
            }`}
            title={currentSlide.link ? `Click to visit: ${currentSlide.link}` : currentSlide.title}
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              loading="eager"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            />
          </motion.div>
        </AnimatePresence>

        {/* Subtle, soft light gradient overlay for readability (never heavy black) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent pointer-events-none z-2" />

        {/* Animated Banner Logo Badge (Configured from Admin Slider & Banner Manager) */}
        {activeLogo && activeLogo.active && activeLogo.url && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute z-20 pointer-events-none ${getPositionClass(
              activeLogo.position
            )}`}
          >
            <motion.div
              {...getLogoAnimation(activeLogo.animation)}
              className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-white/70"
            >
              <img
                src={activeLogo.url}
                alt="Banner Logo"
                className={`w-auto object-contain shrink-0 ${getSizeClass(
                  activeLogo.size
                )}`}
              />
              {activeLogo.title && (
                <div className="hidden sm:block pr-2">
                  <span className="font-black text-xs md:text-sm text-slate-900 leading-tight block">
                    {activeLogo.title}
                  </span>
                  {activeLogo.subtitle && (
                    <span className="text-[10px] font-semibold text-blue-600 block">
                      {activeLogo.subtitle}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Interactive Clickable & Animated ORDER NOW CTA Button directly placed on the banner */}
        <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-8 md:bottom-8 md:left-12 z-10 flex flex-col gap-2 max-w-lg">
          {currentSlide.banglaTitle && (
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-900/80 text-blue-200 text-xs font-bold border border-blue-400/30 backdrop-blur-xs w-fit shadow-md">
              {currentSlide.banglaTitle}
            </span>
          )}

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <AnimatedButton
              variant="accent"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                handleSlideClick(currentSlide);
              }}
              pulse
              className="!bg-gradient-to-r !from-blue-600 !via-blue-700 !to-indigo-700 hover:!from-blue-500 hover:!to-indigo-600 !text-white text-xs sm:text-sm md:text-base font-black px-4 sm:px-7 py-2 sm:py-3.5 shadow-2xl shadow-blue-900/40 border border-blue-400/40 uppercase tracking-wider rounded-full cursor-pointer"
              rightIcon={
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1.5 transition-transform" />
              }
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="p-0.5 sm:p-1 rounded-full bg-white/20">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                </span>
                <span>{ctaText}</span>
              </div>
            </AnimatedButton>
          </motion.div>
        </div>

        {/* Carousel Navigation Arrows (When more than 1 slide) */}
        {displaySlides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(
                  currentIndex === 0 ? displaySlides.length - 1 : currentIndex - 1
                );
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all z-20 cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(
                  currentIndex === displaySlides.length - 1 ? 0 : currentIndex + 1
                );
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg backdrop-blur-xs transition-all z-20 cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots Indicators */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full"
            >
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(i);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === i ? 'w-5 bg-white' : 'w-2 bg-white/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trust Badges Bar underneath */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 px-3 sm:px-6 py-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold p-1 sm:p-1.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-slate-900 block leading-tight truncate text-[11px] sm:text-xs">
              Safe & Secure
            </span>
            <span className="text-[10px] text-slate-500 font-normal block truncate">
              100% Genuine Items
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700 font-semibold p-1 sm:p-1.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-slate-900 block leading-tight truncate text-[11px] sm:text-xs">
              Fast Delivery
            </span>
            <span className="text-[10px] text-slate-500 font-normal block truncate">
              24-48 Hours Express
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700 font-semibold p-1 sm:p-1.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-slate-900 block leading-tight truncate text-[11px] sm:text-xs">
              Wide Selection
            </span>
            <span className="text-[10px] text-slate-500 font-normal block truncate">
              Top Gadgets & Gears
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700 font-semibold p-1 sm:p-1.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-slate-900 block leading-tight truncate text-[11px] sm:text-xs">
              24/7 Support
            </span>
            <span className="text-[10px] text-slate-500 font-normal block truncate">
              Dedicated Helpline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
