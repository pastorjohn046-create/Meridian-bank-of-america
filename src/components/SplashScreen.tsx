import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <Logo size="lg" />
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-white text-3xl font-black tracking-tighter"
          >
            WHSBC BANK
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold"
          >
            Private Wealth Management
          </motion.p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-12"
      >
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </motion.div>
    </div>
  );
};
