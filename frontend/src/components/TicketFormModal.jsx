import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, Loader2, Sparkles, AlertTriangle, ArrowUpRight, Minus } from 'lucide-react';
import { ticketApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export const TicketFormModal = ({ isOpen, onClose, onTicketCreated }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickSubjects = [
    'Billing or Invoice Discrepancy',
    'Login & Authentication Failure',
    'Feature Request & Feedback',
    'API Integration Error 500',
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await ticketApi.createTicket(formData);
      if (res.data.success) {
        showToast('Ticket raised successfully! Support will review it shortly.', 'success');
        onTicketCreated(res.data.ticket);
        onClose();
        setFormData({ subject: '', description: '', priority: 'medium' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create ticket. Please check input.';
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const priorityConfig = {
    low: { label: 'Low', icon: Minus, activeBg: 'bg-slate-700 text-white border-slate-700 shadow-sm' },
    medium: { label: 'Medium', icon: ArrowUpRight, activeBg: 'bg-sky-600 text-white border-sky-600 shadow-sm' },
    high: { label: 'High', icon: AlertTriangle, activeBg: 'bg-orange-600 text-white border-orange-600 shadow-sm' },
    urgent: { label: 'Urgent', icon: AlertTriangle, activeBg: 'bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse' },
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Raise New Support Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">Please provide specific details to help our team resolve your issue.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Quick Subject Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quick Topics:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickSubjects.map((qs) => (
                <button
                  type="button"
                  key={qs}
                  onClick={() => setFormData({ ...formData, subject: qs })}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors"
                >
                  {qs}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ticket Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cannot process credit card payment"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                errors.subject ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'
              } outline-none transition-all`}
            />
            {errors.subject && <p className="text-[11px] text-rose-600 mt-1">{errors.subject}</p>}
          </div>

          {/* Priority Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(priorityConfig).map(([pKey, config]) => {
                const Icon = config.icon;
                const isSelected = formData.priority === pKey;
                return (
                  <button
                    type="button"
                    key={pKey}
                    onClick={() => setFormData({ ...formData, priority: pKey })}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? config.activeBg
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.description.length} chars
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Provide context, exact steps to reproduce the issue, and expected behavior..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                errors.description ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500'
              } outline-none transition-all resize-none`}
            />
            {errors.description && <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
