import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Sparkles,
  ExternalLink,
  Loader2,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { Product } from '../types';
import { AnimatedButton } from './AnimatedButton';

interface AiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  lang: 'en' | 'bn';
}

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export const AiSearchModal: React.FC<AiSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);

  // Instant Auto-Search as you type!
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setMatchedProducts([]);
      return;
    }

    const matches = products.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBangla = p.banglaTitle?.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      return matchTitle || matchBangla || matchCat || matchDesc;
    });

    setMatchedProducts(matches);
  }, [query, products]);

  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setAiAnswer(null);
    setGroundingChunks([]);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnswer(data.text || '');
        setGroundingChunks(data.groundingChunks || []);
      } else {
        setAiAnswer(
          'Duari Shop provides fast doorstep delivery across Bangladesh for modern electronics, gaming consoles (like J36 Ultra), wireless microphones, and home gadgets at competitive prices.'
        );
      }
    } catch (err) {
      setAiAnswer(
        'Duari Shop provides fast doorstep delivery across Bangladesh for modern electronics, gaming consoles (like J36 Ultra), wireless microphones, and home gadgets at competitive prices.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    'J36 Ultra',
    'TWS M28 Earbuds',
    'Mini Turbo Fan',
    'Smart Watch',
    'Wireless Mic',
    'Projector',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-16 flex items-start justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            {/* Search Input Bar (with Instant Auto-Search) */}
            <form onSubmit={handleAiSearch} className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'পণ্যের নাম লিখুন, সাথে সাথে ফলাফল আসবে (e.g. J36, earbuds, fan)...'
                    : 'Type product name for instant auto-search (e.g. J36, earbuds, fan)...'
                }
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setAiAnswer(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <AnimatedButton
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLoading}
                className="shrink-0 text-xs font-bold"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                AI Search
              </AnimatedButton>
            </form>

            {/* Quick suggested chips */}
            {!query && !aiAnswer && (
              <div className="p-4 bg-white space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Popular Quick Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sampleQueries.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
              {/* Instant Auto-searched Catalog Products */}
              {matchedProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                      Auto Found Products ({matchedProducts.length})
                    </h4>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Instant Search
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          onClose();
                        }}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer bg-white group hover:bg-blue-50/40"
                      >
                        <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">
                            {prod.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-slate-900">
                              ৳ {prod.price.toLocaleString()}
                            </span>
                            {prod.discountPercent > 0 && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1 py-0.2 rounded">
                                -{prod.discountPercent}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-700">{prod.rating}</span>
                            <span className="text-slate-400">({prod.reviewsCount})</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No matches notice */}
              {query.trim() && matchedProducts.length === 0 && !isLoading && (
                <div className="p-6 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">
                    No matching products found in the catalog for "{query}".
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click "AI Search" above to look up technical details, specs, and online reviews using Google Search!
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="py-10 flex flex-col items-center justify-center space-y-3 text-slate-500">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                  <p className="text-xs font-semibold text-slate-600 animate-pulse">
                    Querying live Google Search data & specs...
                  </p>
                </div>
              )}

              {/* AI Search Answer with Search Grounding */}
              {aiAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Assistant Grounded with Google Search</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    {aiAnswer}
                  </p>

                  {/* Grounding Source chips */}
                  {groundingChunks && groundingChunks.length > 0 && (
                    <div className="pt-2 border-t border-blue-200/50 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Verified Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {groundingChunks.slice(0, 4).map((chunk, i) =>
                          chunk.web?.uri ? (
                            <a
                              key={i}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-blue-700 hover:text-blue-900 border border-blue-200 text-xs font-medium hover:shadow-xs transition-all"
                            >
                              <ExternalLink className="w-3 h-3 text-blue-500" />
                              <span className="truncate max-w-[180px]">
                                {chunk.web.title || new URL(chunk.web.uri).hostname}
                              </span>
                            </a>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
