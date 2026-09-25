import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LifeBuoy, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

export const RegisterPage = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
      await register(formData.name, formData.email, formData.password, 'customer');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed.');
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
          Create Customer Account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign up to raise and track your support tickets
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  } outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="jane.doe@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  } outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  } outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  } outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
