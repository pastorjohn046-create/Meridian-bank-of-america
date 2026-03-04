import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { WalletScreen } from './components/Wallet';
import { ExchangeScreen } from './components/Exchange';
import { MarketScreen } from './components/Market';
import { TransactionDetails } from './components/TransactionDetails';
import { ProfileScreen } from './components/Profile';
import { AdminPortal } from './components/AdminPortal';
import { SendScreen } from './components/SendScreen';
import { WithdrawScreen } from './components/WithdrawScreen';
import { LoginScreen } from './components/Login';
import { SignupScreen } from './components/Signup';
import { ChatBox } from './components/ChatBox';
import { AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { cn } from './lib/utils';
import { api } from './services/api';

function AppContent() {
  const location = useLocation();
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const currentUserRef = useRef<any>(null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const savedUser = localStorage.getItem('meridian_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.email === 'Jobfindercorps@gmail.com');
      
      // Refresh user data from master list immediately on mount
      // This ensures that if the balance was updated while the user was away, it reflects now
      api.syncCurrentUser(user.id).then(updated => {
        if (updated) {
          setCurrentUser(updated);
        }
      });
    }
  }, []);

  // Periodically refresh user data as a fallback
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    // Poll more frequently if offline or if we want to be extra sure
    const intervalTime = isOnline ? 10000 : 2000; 

    const interval = setInterval(() => {
      api.syncCurrentUser(currentUser.id).then(updated => {
        if (updated && JSON.stringify(updated) !== JSON.stringify(currentUserRef.current)) {
          setCurrentUser(updated);
          localStorage.setItem('meridian_user', JSON.stringify(updated));
        }
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOnline, isAuthenticated, !!currentUser]);

  const handleLogin = (user: any, admin?: boolean) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAdmin(!!admin || user.email === 'Jobfindercorps@gmail.com');
    localStorage.setItem('meridian_user', JSON.stringify(user));
  };

  const updateUser = (user: any) => {
    if (!user) return;
    setCurrentUser(user);
    localStorage.setItem('meridian_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('meridian_user');
  };

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let heartbeatInterval: any = null;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Connected to notifications');
        setIsOnline(true);
        
        // Heartbeat to keep connection alive (important for Railway/Cloud)
        heartbeatInterval = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 30000);
      };

      socket.onerror = (error) => {
        console.warn('WebSocket connection failed. Notifications will be disabled.');
        setIsOnline(false);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        setIsOnline(false);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        reconnectTimeout = setTimeout(connect, 3000); // Try to reconnect every 3 seconds
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'NOTIFICATION') {
            const { title, message: text, amount, asset } = message.data;
            toast.success(title, {
              description: `${text} ${amount ? `(${amount} ${asset})` : ''}`,
              duration: 5000,
            });
          } else if (message.type === 'USER_UPDATED') {
            const updatedUser = message.data;
            // Only update if it's the current user
            if (currentUserRef.current && updatedUser.id === currentUserRef.current.id) {
              updateUser(updatedUser);
              toast.info('Account Updated', {
                description: 'Your account details or balance have been updated by the system.',
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'meridian_user') {
        if (e.newValue) {
          setCurrentUser(JSON.parse(e.newValue));
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Hide header and bottom nav on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const showBottomNav = isAuthenticated && !isAuthPage && !location.pathname.startsWith('/transaction/');
  const showHeader = isAuthenticated && !isAuthPage;

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300",
      theme === 'dark' ? "bg-zinc-950 text-zinc-100" : "bg-gray-50 text-gray-900"
    )}>
      <Toaster position="top-center" expand={true} richColors theme={theme} />
      {/* Mobile Container Simulation for Desktop */}
      <div className={cn(
        "max-w-md mx-auto min-h-screen relative md:border-x transition-colors duration-300 overflow-hidden flex flex-col",
        theme === 'dark' ? "bg-zinc-950 border-zinc-800 shadow-zinc-900/50" : "bg-white border-gray-100 shadow-2xl shadow-gray-200/50"
      )}>
        {showHeader && <Header onOpenChat={() => setIsChatOpen(true)} />}
        
        <main className={cn(
          "flex-1 overflow-y-auto no-scrollbar",
          showHeader ? "pt-2" : ""
        )}>
          <AnimatePresence mode="wait">
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/login" element={!isAuthenticated ? <LoginScreen onLogin={handleLogin} /> : <Navigate to="/" />} />
              <Route path="/signup" element={!isAuthenticated ? <SignupScreen onLogin={handleLogin} /> : <Navigate to="/" />} />

              {/* Protected Routes */}
              <Route path="/" element={isAuthenticated ? <Dashboard user={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/wallet" element={isAuthenticated ? <WalletScreen user={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/exchange" element={isAuthenticated ? <ExchangeScreen user={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/market" element={isAuthenticated ? <MarketScreen user={currentUser} /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isAuthenticated ? <ProfileScreen isAdmin={isAdmin} user={currentUser} onLogout={handleLogout} onOpenChat={() => setIsChatOpen(true)} /> : <Navigate to="/login" />} />
              <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminPortal onUpdateUser={updateUser} currentUser={currentUser} /> : <Navigate to="/" />} />
              <Route path="/send" element={isAuthenticated ? <SendScreen user={currentUser} onUpdateUser={updateUser} /> : <Navigate to="/login" />} />
              <Route path="/withdraw" element={isAuthenticated ? <WithdrawScreen user={currentUser} onUpdateUser={updateUser} /> : <Navigate to="/login" />} />
              <Route path="/transaction/:id" element={isAuthenticated ? <TransactionDetails /> : <Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </main>

        {showBottomNav && <BottomNav />}
        
        {isAuthenticated && currentUser && (
          <ChatBox 
            user={currentUser} 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
