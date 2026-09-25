import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketApi, userApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/TicketBadge';
import { 
  ArrowLeft, 
  Send, 
  User, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

export const TicketDetailPage = ({ ticketId, onBack }) => {
  const { user, isAgent } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Agent update state
  const [statusVal, setStatusVal] = useState('');
  const [priorityVal, setPriorityVal] = useState('');
  const [assignedVal, setAssignedVal] = useState('');
  const [savingTriage, setSavingTriage] = useState(false);
  const [triageSuccess, setTriageSuccess] = useState(false);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, cRes] = await Promise.all([
        ticketApi.getTicketById(ticketId),
        ticketApi.getComments(ticketId),
      ]);

      const t = tRes.data.ticket;
      setTicket(t);
      setComments(cRes.data.comments || []);
      setStatusVal(t.status);
      setPriorityVal(t.priority);
      setAssignedVal(t.assigned_to || '');

      if (isAgent) {
        const agRes = await userApi.getAgents();
        setAgents(agRes.data.users || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    setSubmittingComment(true);
    setCommentError('');
    try {
      const res = await ticketApi.addComment(ticketId, newComment.trim());
      setComments([...comments, res.data.comment]);
      setNewComment('');

      // If agent commented and status was open, update local status
      if (isAgent && ticket.status === 'open') {
        setTicket({ ...ticket, status: 'in_progress' });
        setStatusVal('in_progress');
      }
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveTriage = async () => {
    setSavingTriage(true);
    setTriageSuccess(false);
    try {
      const updatePayload = {
        status: statusVal,
        priority: priorityVal,
        assigned_to: assignedVal === '' ? null : parseInt(assignedVal, 10),
      };

      const res = await ticketApi.updateTicket(ticketId, updatePayload);
      setTicket(res.data.ticket);
      setTriageSuccess(true);
      setTimeout(() => setTriageSuccess(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setSavingTriage(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      await ticketApi.deleteTicket(ticketId);
      onBack();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading conversation thread...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-900 text-lg">Unable to Access Ticket</h3>
        <p className="text-sm text-slate-500 mt-1">{error || 'Ticket not found or forbidden.'}</p>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tickets</span>
        </button>

        {/* Delete option for Owner or Agent */}
        {(isAgent || (ticket.user_id === user?.id && ticket.status === 'open')) && (
          <button
            onClick={handleDeleteTicket}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Ticket</span>
          </button>
        )}
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">TICKET #{ticket.id}</span>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {ticket.subject}
              </h1>
            </div>

            {/* Author details */}
            <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5 bg-slate-50 p-3 sm:bg-transparent sm:p-0 rounded-xl">
              <div>
                Submitted by: <strong className="text-slate-800">{ticket.customer_name}</strong>
              </div>
              <div className="font-mono text-[11px] text-slate-400">{ticket.customer_email}</div>
              <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-400 pt-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Ticket Description
            </h3>
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Agent Triage Controls (Agent Only) */}
          {isAgent && (
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Agent Ticket Controls
                </h3>
                {triageSuccess && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Changes Saved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-950 mb-1">Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-950 mb-1">Priority</label>
                  <select
                    value={priorityVal}
                    onChange={(e) => setPriorityVal(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-950 mb-1">Assigned Agent</label>
                  <select
                    value={assignedVal}
                    onChange={(e) => setAssignedVal(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveTriage}
                  disabled={savingTriage}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingTriage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Triage Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discussion / Comments Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Responses & Discussion ({comments.length})
          </h2>
          <span className="text-xs text-slate-400">All responses are recorded chronologically</span>
        </div>

        <div className="p-6 space-y-6">
          {comments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No replies on this ticket yet. Add a response below to start the conversation.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                const isAgentComment = c.user_role === 'agent';
                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isAgentComment
                        ? 'bg-gradient-to-r from-indigo-50/60 to-blue-50/30 border-indigo-200/80 ml-4 sm:ml-8'
                        : 'bg-slate-50/80 border-slate-200 mr-4 sm:mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isAgentComment ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {c.user_name ? c.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{c.user_name}</span>
                        {isAgentComment ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">
                            <ShieldCheck className="w-3 h-3" /> Support Agent
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-md">
                            Customer
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-8">
                      {c.comment}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Reply Form */}
          <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {isAgent ? 'Post Agent Response' : 'Reply to Support Team'}
            </h3>

            {commentError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{commentError}</span>
              </div>
            )}

            <textarea
              rows={3}
              placeholder={isAgent ? 'Provide helpful guidance, updates, or resolution steps...' : 'Add clarification or followup information...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
