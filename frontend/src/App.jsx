import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium tracking-wide">Initializing SupportHub...</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
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

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Support Ticket Management System &copy; 2026</span>
          <span className="text-[11px] text-slate-400">Junior Full Stack Developer Technical Assessment</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
