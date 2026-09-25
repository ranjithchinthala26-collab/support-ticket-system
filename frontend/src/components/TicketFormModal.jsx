import React, { useState } from 'react';
import { X, Send, AlertCircle, Loader2 } from 'lucide-react';
import { ticketApi } from '../services/api';

export const TicketFormModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  if (!isOpen) return null;

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
        onTicketCreated(res.data.ticket);
        onClose();
        setFormData({ subject: '', description: '', priority: 'medium' });
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create ticket. Please check input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Raise New Support Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">Please provide specific details to help our team resolve your issue.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
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

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ticket Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cannot process credit card payment"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                errors.subject ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
              } outline-none focus:ring-4 transition-all`}
            />
            {errors.subject && <p className="text-xs text-rose-600 mt-1">{errors.subject}</p>}
          </div>

          {/* Priority Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`py-2 text-xs font-medium capitalize rounded-xl border transition-all text-center ${
                    formData.priority === p
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Detailed explanation of the issue, steps to reproduce, and any error messages..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                errors.description ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
              } outline-none focus:ring-4 transition-all resize-none`}
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
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
