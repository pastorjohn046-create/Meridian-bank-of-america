import React from 'react';
import { Bell, User, Search, Sun, Moon, Compass, Headset } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

interface HeaderProps {
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenChat }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={cn(
      "flex items-center justify-between px-5 py-3 sticky top-0 backdrop-blur-md z-40 transition-colors duration-300",
      theme === 'dark' ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-gray-50"
    )}>
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/HSBC_logo_%282018%29.svg/1280px-HSBC_logo_%282018%29.svg.png" 
            alt="HSBC Logo" 
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className={cn("text-sm font-black tracking-tighter transition-colors", theme === 'dark' ? "text-zinc-100" : "text-gray-900")}>HSBC BANK</h1>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Private Banking</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className={cn(
            "p-2 rounded-full transition-all active:scale-90",
            theme === 'dark' ? "text-zinc-400 hover:bg-zinc-900" : "text-gray-500 hover:bg-gray-100"
          )}
          onClick={onOpenChat}
        >
          <Headset size={18} />
        </button>
        <button 
          onClick={toggleTheme}
          className={cn(
            "p-2 rounded-full transition-all active:scale-90",
            theme === 'dark' ? "text-zinc-400 hover:bg-zinc-900" : "text-gray-500 hover:bg-gray-100"
          )}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className={cn(
          "p-2 rounded-full transition-colors relative",
          theme === 'dark' ? "text-zinc-400 hover:bg-zinc-900" : "text-gray-500 hover:bg-gray-100"
        )}>
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
        </button>
        <Link to="/profile" className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden border border-gray-100 dark:border-zinc-800 transition-transform active:scale-90">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User" 
            referrerPolicy="no-referrer"
          />
        </Link>
      </div>
    </header>
  );
};
