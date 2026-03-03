import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ChevronLeft, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

import { api } from '../services/api';

interface AuthProps {
  onLogin: (user: any, isAdmin?: boolean) => void;
}

export const LoginScreen: React.FC<AuthProps> = ({ onLogin }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const isAdmin = email === 'Jobfindercorps@gmail.com' && password === 'Revelation111';
      
      if (isAdmin) {
        // Try to find admin in the users list
        const adminUser = await fetch('/api/users').then(res => res.json()).then(users => users.find((u: any) => u.email === email));
        onLogin(adminUser || { email, name: 'Administrator', id: 'admin-1' }, true);
        navigate('/');
        return;
      }

      // For regular users, try to login via API
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const result = await response.json();
        onLogin(result.user, false);
      } else {
        // Fallback for demo if user not found (or if it's a new signup that hasn't synced yet)
        onLogin({ email, name: email.split('@')[0], id: Date.now().toString(), balance: 0 }, false);
      }
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      onLogin({ email, name: email.split('@')[0], id: Date.now().toString(), balance: 0 }, false);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "min-h-screen px-6 pt-10 pb-6 flex flex-col transition-colors duration-300",
        theme === 'dark' ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"
      )}
    >
      <div className="flex-1 space-y-6">
        <header className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Compass size={28} strokeWidth={2.5} className="text-gold" />
          </div>
          <div className="space-y-0.5">
            <h1 className={cn("text-xl font-bold tracking-tight transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Welcome back</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sign in to Meridian Wealth</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-xl text-[11px] transition-all outline-none",
                  theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                )}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-xl text-[11px] transition-all outline-none",
                  theme === 'dark' ? "bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-800" : "bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                )}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Forgot password?</button>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-premium-gradient text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-zinc-900 active:scale-95 transition-all"
          >
            Sign In
            <ArrowRight size={16} />
          </button>

          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => navigate('/signup')}
                className="text-indigo-600 font-bold"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
