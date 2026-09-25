import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { TicketDetailPage } from './pages/TicketDetailPage';

function AppContent() {
  const { isAuthenticated, isAgent, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading SupportHub...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onNavigateToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  // Authenticated
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 pb-16">
        {selectedTicketId ? (
          <TicketDetailPage
            ticketId={selectedTicketId}
            onBack={() => setSelectedTicketId(null)}
          />
        ) : isAgent ? (
          <AgentDashboard onSelectTicket={(id) => setSelectedTicketId(id)} />
        ) : (
          <CustomerDashboard onSelectTicket={(id) => setSelectedTicketId(id)} />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SupportHub &copy; 2026</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-[11px] text-slate-400">Support Ticket Management System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>MySQL 8.0</span>
            <span>&bull;</span>
            <span>Express.js REST APIs</span>
            <span>&bull;</span>
            <span>React 18 + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
