import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  LayoutTemplate,
} from 'lucide-react';
import { Product } from '../../types';
import { AnimatedButton } from '../AnimatedButton';

interface CategoryManagementTabProps {
  categories: string[];
  products: Product[];
  onAddCategory: (cat: string) => void;
  onDeleteCategory: (cat: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const CategoryManagementTab: React.FC<CategoryManagementTabProps> = ({
  categories,
  products,
  onAddCategory,
  onDeleteCategory,
  onNavigateTab,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage('এই ক্যাটাগরিটি ইতিমধ্যে যুক্ত আছে! (Category already exists)');
      return;
    }
    setErrorMessage(null);
    onAddCategory(trimmed);
    setNewCatName('');
    setIsAdding(false);
    showToast(`"${trimmed}" ক্যাটাগরি সফলভাবে তৈরি হয়েছে!`);
  };

  const handleConfirmDelete = () => {
    if (!deletingCat) return;
    const cat = deletingCat;
    onDeleteCategory(cat);
    setDeletingCat(null);
    showToast(`"${cat}" ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে! (Category deleted)`);
  };

  const availableCategories = categories.filter((c) => c !== 'All Categories');

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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            ক্যাটাগরি ম্যানেজমেন্ট (Category Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            স্টোরের ক্যাটাগরি সমূহ যোগ করুন, সাজান এবং সহজে ডিলিট করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('sections')}
              className="text-xs font-bold"
              leftIcon={<LayoutTemplate className="w-3.5 h-3.5" />}
            >
              হোমপেইজ সেকশন ম্যানেজার
            </AnimatedButton>
          )}

          <AnimatedButton
            variant="primary"
            size="md"
            onClick={() => {
              setIsAdding(true);
              setErrorMessage(null);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold text-xs"
          >
            নতুন ক্যাটাগরি যোগ করুন (Add Category)
          </AnimatedButton>
        </div>
      </div>

      {/* Add Category Card */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-900">
                নতুন ক্যাটাগরি তৈরি করুন (Create Category)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                required
                autoFocus
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. Smart Watch & Accessories..."
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-blue-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <AnimatedButton variant="primary" size="sm" type="submit" className="font-bold text-xs">
                Save Category
              </AnimatedButton>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setErrorMessage(null);
                }}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-600 font-bold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableCategories.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          return (
            <div
              key={cat}
              className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{cat}</h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
              </div>

              {/* Working Delete Button triggering in-app dialog */}
              <button
                onClick={() => setDeletingCat(cat)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title={`Delete category "${cat}"`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* In-App Delete Category Confirmation Modal (NO window.confirm!) */}
      <AnimatePresence>
        {deletingCat && (
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
                    ক্যাটাগরি ডিলিট করতে চান?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to delete category "{deletingCat}"?
                  </p>
                </div>
              </div>

              <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-800">
                <p className="font-semibold">
                  এই ক্যাটাগরিটি ডিলিট করলে স্টোরের সাইডবার ও ফিল্টার থেকে এটি সাথে সাথে মুছে যাবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCat(null)}
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
    </div>
  );
};
