import { useEffect, useState } from 'react';
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
import { LoginScreen } from './components/Login';
import { SignupScreen } from './components/Signup';
import { AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { cn } from './lib/utils';

function AppContent() {
  const location = useLocation();
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'NOTIFICATION') {
          const { title, message: text, amount, asset } = message.data;
          toast.success(title, {
            description: `${text} ${amount ? `(${amount} ${asset})` : ''}`,
            duration: 5000,
          });
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    return () => socket.close();
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
        {showHeader && <Header />}
        
        <main className={cn(
          "flex-1 overflow-y-auto no-scrollbar",
          showHeader ? "pt-2" : ""
        )}>
          <AnimatePresence mode="wait">
            <Routes location={location}>
              {/* Public Routes */}
              <Route path="/login" element={!isAuthenticated ? <LoginScreen onLogin={(admin) => {
                setIsAuthenticated(true);
                setIsAdmin(!!admin);
              }} /> : <Navigate to="/" />} />
              <Route path="/signup" element={!isAuthenticated ? <SignupScreen onLogin={() => {
                setIsAuthenticated(true);
                setIsAdmin(false);
              }} /> : <Navigate to="/" />} />

              {/* Protected Routes */}
              <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/wallet" element={isAuthenticated ? <WalletScreen /> : <Navigate to="/login" />} />
              <Route path="/exchange" element={isAuthenticated ? <ExchangeScreen /> : <Navigate to="/login" />} />
              <Route path="/market" element={isAuthenticated ? <MarketScreen /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isAuthenticated ? <ProfileScreen isAdmin={isAdmin} /> : <Navigate to="/login" />} />
              <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminPortal /> : <Navigate to="/" />} />
              <Route path="/transaction/:id" element={isAuthenticated ? <TransactionDetails /> : <Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </main>

        {showBottomNav && <BottomNav />}
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
