import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, KeyRound, Eye, EyeOff, ShieldCheck, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ADMIN_SECURITY_CREDENTIALS } from '../../data/initialAdminData';

interface AdminSecurityLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  lang?: 'en' | 'bn';
}

export const AdminSecurityLoginModal: React.FC<AdminSecurityLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang = 'bn',
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const normalizedUser = username.trim().toLowerCase();
      const expectedUser = ADMIN_SECURITY_CREDENTIALS.username.toLowerCase();
      const expectedPass = ADMIN_SECURITY_CREDENTIALS.password;

      if (normalizedUser === expectedUser && password === expectedPass) {
        setIsSuccess(true);
        localStorage.setItem('duari_admin_session', 'true');
        setTimeout(() => {
          setIsLoading(false);
          setIsSuccess(false);
          setPassword('');
          onLoginSuccess();
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMessage(
          lang === 'bn'
            ? 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! পুনরায় চেষ্টা করুন।'
            : 'Invalid Admin username or password! Please try again.'
        );
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100 shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">
                {lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি লগইন' : 'Admin Security Access'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {lang === 'bn'
                  ? 'ডুয়ারি শপ অ্যাডমিন অপশন ব্যবহারের জন্য অথোরাইজড ইউজারনেম এবং পাসওয়ার্ড দিন।'
                  : 'Enter authorized admin credentials to unlock the dashboard.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {isSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>লগইন সফল হয়েছে! অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  অ্যাডমিন ইউজারনেম (Email)*
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="durjoy422@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  সিকিউরিটি পাসওয়ার্ড (Password)*
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-900 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন (Unlock Admin)'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
