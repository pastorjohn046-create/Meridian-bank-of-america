import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ChevronLeft, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Key,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

import { api } from '../services/api';

interface AuthProps {
  onLogin: (user: any) => void;
}

type SignupStep = 'personal' | 'security' | 'verification' | 'success';

export const SignupScreen: React.FC<AuthProps> = ({ onLogin }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<SignupStep>('personal');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    pin: '',
  });

  const handleNext = () => {
    if (step === 'personal') setStep('security');
    else if (step === 'security') setStep('verification');
    else if (step === 'verification') setStep('success');
  };

  const handleBack = () => {
    if (step === 'personal') navigate('/login');
    else if (step === 'security') setStep('personal');
    else if (step === 'verification') setStep('security');
  };

  const handleComplete = async () => {
    try {
      const data = await api.registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pin: formData.pin,
      });
      
      if (data.status === 'ok') {
        onLogin(data.user);
        navigate('/');
      } else {
        import('sonner').then(({ toast }) => toast.error(data.message || 'Registration failed.'));
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      import('sonner').then(({ toast }) => toast.error('Registration failed. Please try again.'));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'personal':
        return (
          <motion.div 
            key="personal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h2 className={cn("text-xl font-bold tracking-tight", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Personal Details</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Step 1 of 3</p>
            </div>
            <div className="space-y-2.5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-[11px] transition-all outline-none",
                    theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="email" 
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-[11px] transition-all outline-none",
                    theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="tel" 
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-[11px] transition-all outline-none",
                    theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                />
              </div>
            </div>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div 
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h2 className={cn("text-xl font-bold tracking-tight", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Security Setup</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Step 2 of 3</p>
            </div>
            <div className="space-y-2.5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="password" 
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-[11px] transition-all outline-none",
                    theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                />
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="password" 
                  maxLength={6}
                  placeholder="Set 6-digit PIN"
                  value={formData.pin}
                  onChange={(e) => setFormData({...formData, pin: e.target.value})}
                  className={cn(
                    "w-full pl-11 pr-4 py-3 rounded-xl text-[11px] transition-all outline-none",
                    theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                />
              </div>
            </div>
          </motion.div>
        );
      case 'verification':
        return (
          <motion.div 
            key="verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h2 className={cn("text-xl font-bold tracking-tight", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Identity Check</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Step 3 of 3</p>
            </div>
            <div className={cn(
              "p-5 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3",
              theme === 'dark' ? "border-zinc-800 bg-zinc-900/30" : "border-gray-200 bg-gray-50"
            )}>
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                <ShieldCheck size={24} />
              </div>
              <div className="space-y-1">
                <p className={cn("text-xs font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Verify Identity</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">Please upload a photo of your ID or Passport to comply with banking regulations.</p>
              </div>
              <button type="button" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Upload Document</button>
            </div>
          </motion.div>
        );
      case 'success':
        return (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center space-y-6 py-10"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h2 className={cn("text-2xl font-bold tracking-tight", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Account Ready</h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mx-auto">Welcome to HSBC BANK. Your private banking journey begins now.</p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "min-h-screen px-6 pt-6 pb-6 flex flex-col transition-colors duration-300",
        theme === 'dark' ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"
      )}
    >
      {step !== 'success' && (
        <button 
          onClick={handleBack}
          className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center mb-4 transition-colors",
            theme === 'dark' ? "border-zinc-800 text-zinc-400" : "border-gray-100 text-gray-600"
          )}
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <div className="py-2">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        {step !== 'success' ? (
          <button 
            onClick={handleNext}
            className="w-full py-4 bg-premium-gradient text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-zinc-900 active:scale-95 transition-all"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            onClick={handleComplete}
            className="w-full py-4 bg-premium-gradient text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-zinc-900 active:scale-95 transition-all"
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </button>
        )}

        {step === 'personal' && (
          <p className="text-center text-xs text-gray-500 font-medium">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-indigo-600 font-bold"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </motion.div>
  );
};
