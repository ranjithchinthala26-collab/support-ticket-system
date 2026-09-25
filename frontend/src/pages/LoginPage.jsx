import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LifeBuoy, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  UserCheck, 
  Shield, 
  Eye, 
  EyeOff, 
  Sparkles,
  Users
} from 'lucide-react';

export const LoginPage = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back! Signed in successfully.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword, roleLabel) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      showToast(`Signed in as ${roleLabel}!`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Quick login failed.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 items-center justify-center text-white shadow-2xl shadow-blue-500/40 ring-4 ring-white/10 mb-4 transform hover:scale-105 transition-all">
          <LifeBuoy className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white">
          SupportHub Portal
        </h2>
        <p className="mt-1 text-xs text-indigo-200/80 font-medium">
          Support Ticket Management System &bull; Technical Assessment
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-black/30 rounded-3xl border border-white/20">
          
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500'
                  } outline-none transition-all`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border ${
                    errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500'
                  } outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Evaluator */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>One-Click Demo Logins</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@demo.com', 'Customer123!', 'John (Customer)')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-xl transition-all"
                title="Login as John Customer (has open & in-progress tickets)"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate">Customer: John</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent@support.com', 'Agent123!', 'Bob (Agent)')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-xl transition-all"
                title="Login as Bob Support Agent"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span className="truncate">Agent: Bob</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alice@demo.com', 'Customer123!', 'Alice (Customer 2)')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-xl transition-all"
                title="Demonstrates Customer Ticket Isolation"
              >
                <Users className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span className="truncate">Customer: Alice</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah@support.com', 'Agent123!', 'Sarah (Agent 2)')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-xl transition-all"
                title="Login as Sarah Support Agent"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="truncate">Agent: Sarah</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Need a new customer account?{' '}
              <button
                onClick={onNavigateToRegister}
                className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
