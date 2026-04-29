import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Headset, 
  Mail, 
  MessageCircle, 
  Phone, 
  ChevronRight, 
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

interface SupportScreenProps {
  onOpenChat: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({ onOpenChat }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const faqs = [
    { q: "How do I secure my account?", a: "Enable 2FA and use a strong, unique password for your WHSBC account." },
    { q: "What are the transfer limits?", a: "Limits vary based on your account tier. Private members enjoy unlimited transfers." },
    { q: "How long do withdrawals take?", a: "Most withdrawals are processed instantly, but some may take up to 24 hours." },
    { q: "Can I cancel a transaction?", a: "Completed blockchain transactions cannot be reversed or cancelled." }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-5 pb-10 space-y-6"
    >
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/profile')}
          className={cn(
            "p-2 rounded-xl transition-colors",
            theme === 'dark' ? "bg-zinc-900 text-zinc-400" : "bg-gray-100 text-gray-600"
          )}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className={cn("text-lg font-bold transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Customer Care</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">24/7 Global Support</p>
        </div>
      </header>

      {/* Main Support Options */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onOpenChat}
          className={cn(
            "p-4 rounded-[1.5rem] flex flex-col items-center text-center space-y-2 transition-all active:scale-95",
            theme === 'dark' ? "bg-indigo-600 text-white" : "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          )}
        >
          <MessageCircle size={24} />
          <p className="text-[11px] font-bold uppercase tracking-wider">Live Chat</p>
          <p className="text-[9px] opacity-80">Instant Response</p>
        </button>

        <a 
          href="mailto:support@whsbc.bank"
          className={cn(
            "p-4 rounded-[1.5rem] flex flex-col items-center text-center space-y-2 transition-all active:scale-95 border",
            theme === 'dark' ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900 shadow-sm"
          )}
        >
          <Mail size={24} className="text-indigo-500" />
          <p className="text-[11px] font-bold uppercase tracking-wider">Email Us</p>
          <p className="text-[9px] text-gray-500">2h Response Time</p>
        </a>
      </div>

      <div className={cn(
        "p-4 rounded-2xl flex items-center justify-between border",
        theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-gray-50 border-gray-100"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Phone size={20} />
          </div>
          <div className="text-left">
            <p className={cn("text-[11px] font-bold", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>Priority Phone Line</p>
            <p className="text-[9px] text-gray-500">+1 (800) WHSBC-PRIVATE</p>
          </div>
        </div>
        <button className="text-indigo-500 p-2">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Frequent Questions</h3>
          <button className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest flex items-center gap-1">
            Browse All <ExternalLink size={10} />
          </button>
        </div>
        
        <div className={cn(
          "rounded-2xl overflow-hidden border",
          theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-100"
        )}>
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className={cn(
                "p-4 border-b last:border-0",
                theme === 'dark' ? "border-zinc-800" : "border-gray-50"
              )}
            >
              <p className={cn("text-[11px] font-bold mb-1", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>{faq.q}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Center Search Mock */}
      <div className={cn(
        "relative p-1 rounded-2xl border",
        theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"
      )}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search help topics..."
          className={cn(
            "w-full pl-10 pr-4 py-3 rounded-xl text-[11px] font-medium outline-none",
            theme === 'dark' ? "bg-transparent text-zinc-100" : "bg-transparent text-gray-900"
          )}
        />
      </div>

      {/* Trust Badges */}
      <div className="flex justify-around items-center pt-4 opacity-50 grayscale transition-all hover:grayscale-0">
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck size={20} className="text-emerald-500" />
          <p className="text-[8px] font-bold uppercase tracking-tighter">SECURE</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Zap size={20} className="text-amber-500" />
          <p className="text-[8px] font-bold uppercase tracking-tighter">INSTANT</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Globe size={20} className="text-blue-500" />
          <p className="text-[8px] font-bold uppercase tracking-tighter">GLOBAL</p>
        </div>
      </div>
      
      <p className="text-center text-[8px] text-gray-500 font-bold uppercase tracking-widest pt-4">
        Official WHSBC Support Channel
      </p>
    </motion.div>
  );
};
