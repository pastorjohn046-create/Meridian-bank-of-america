import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Headset, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

import { api } from '../services/api';

interface Message {
  id: string;
  userId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAdmin?: boolean;
}

interface ChatBoxProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ user, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      // Fetch history
      api.getMessages(user.id)
        .then(data => setMessages(data))
        .catch(err => console.error('Failed to fetch chat history', err));

      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Chat connected');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'CHAT_MESSAGE') {
            const chatMsg = message.data;
            // Only add if it's for this user or from this user
            if (chatMsg.userId === user.id || chatMsg.receiverId === user.id) {
              setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === chatMsg.id)) return prev;
                return [...prev, chatMsg];
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('Chat disconnected');
      };

      setSocket(ws);
      return () => ws.close();
    }
  }, [isOpen, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !socket || socket.readyState !== WebSocket.OPEN) return;

    const messageData = {
      userId: user.id,
      senderName: user.name,
      text: inputText,
      isAdmin: user.email === 'Jobfindercorps@gmail.com'
    };

    socket.send(JSON.stringify({
      type: 'CHAT_MESSAGE',
      data: messageData
    }));

    setInputText('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "fixed bottom-20 right-5 left-5 md:left-auto md:w-80 h-[450px] z-[100] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border",
            theme === 'dark' ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-100"
          )}
        >
          {/* Header */}
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Headset size={16} />
              </div>
              <div>
                <p className="text-xs font-bold">HSBC Support</p>
                <div className="flex items-center gap-1">
                  <div className={cn("w-1 h-1 rounded-full animate-pulse", isConnected ? "bg-emerald-400" : "bg-red-400")} />
                  <p className="text-[9px] opacity-80">{isConnected ? 'Always active for you' : 'Connecting...'}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                <Headset size={32} className="text-indigo-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest">How can we help you today?</p>
                <p className="text-[9px]">Send a message to start a conversation with our private banking team.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col",
                  msg.isAdmin ? "items-start" : "items-end"
                )}
              >
                <div className={cn(
                  "max-w-[85%] p-3 rounded-2xl text-[11px] font-medium shadow-sm",
                  msg.isAdmin 
                    ? (theme === 'dark' ? "bg-zinc-800 text-zinc-100" : "bg-gray-100 text-gray-900")
                    : "bg-indigo-600 text-white"
                )}>
                  {msg.text}
                </div>
                <p className="text-[8px] text-gray-500 mt-1 px-1">
                  {msg.isAdmin ? 'Support' : 'You'} • {format(new Date(msg.timestamp), 'HH:mm')}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={cn(
            "p-3 border-t",
            theme === 'dark' ? "border-zinc-800 bg-zinc-900/50" : "border-gray-100 bg-gray-50"
          )}>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className={cn(
                  "w-full pl-4 pr-10 py-2.5 rounded-xl text-[11px] outline-none transition-all",
                  theme === 'dark' ? "bg-zinc-800 border border-zinc-700 text-zinc-100 focus:border-indigo-500" : "bg-white border border-gray-200 text-gray-900 focus:border-indigo-500"
                )}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition-all active:scale-90"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
