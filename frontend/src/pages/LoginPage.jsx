import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LifeBuoy, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

export const LoginPage = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-4">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          SupportHub Portal
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Support Ticket Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">
          
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  } outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  } outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Evaluator */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Assessment Quick Evaluator Login
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@demo.com', 'Customer123!')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-xl transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Demo Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent@support.com', 'Agent123!')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-xl transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Demo Agent</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Need a new customer account?{' '}
              <button
                onClick={onNavigateToRegister}
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
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
