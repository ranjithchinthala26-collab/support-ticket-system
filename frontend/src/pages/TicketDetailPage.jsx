import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
  Check,
  Copy,
  Sparkles,
  UserPlus,
  Share2
} from 'lucide-react';

export const TicketDetailPage = ({ ticketId, onBack }) => {
  const { user, isAgent } = useAuth();
  const { showToast } = useToast();
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

  // Delete ticket confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cannedResponses = [
    { label: 'Investigating 🔍', text: 'Hello! Our engineering team is currently investigating this issue. We will update you as soon as we make progress.' },
    { label: 'Need More Info ℹ️', text: 'Could you please provide exact steps to reproduce this behavior, along with screenshots or console error messages?' },
    { label: 'Issue Resolved ✅', text: 'We have applied a fix for this issue in our production system. Please verify on your side and let us know if everything works.' },
    { label: 'Escalated 🚀', text: 'This inquiry has been escalated to our senior platform infrastructure team for priority review.' },
  ];

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
      showToast('Response posted successfully!', 'success');

      // If agent commented and status was open, update local status to in_progress
      if (isAgent && ticket.status === 'open') {
        setTicket({ ...ticket, status: 'in_progress' });
        setStatusVal('in_progress');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add comment.';
      setCommentError(msg);
      showToast(msg, 'error');
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
      showToast('Ticket triage settings updated successfully!', 'success');
      setTimeout(() => setTriageSuccess(false), 2500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update ticket.', 'error');
    } finally {
      setSavingTriage(false);
    }
  };

  const handleAssignToMe = () => {
    setAssignedVal(user.id);
    showToast(`Selected yourself (${user.name}) as assigned agent. Click Save Changes.`, 'info');
  };

  const handleCopyTicketInfo = () => {
    navigator.clipboard.writeText(`Ticket #${ticket.id}: ${ticket.subject} - Status: ${ticket.status.toUpperCase()}`);
    setCopiedLink(true);
    showToast(`Copied Ticket #${ticket.id} details to clipboard!`, 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const confirmDeleteTicket = async () => {
    setDeleting(true);
    try {
      await ticketApi.deleteTicket(ticketId);
      showToast(`Ticket #${ticketId} was successfully deleted.`, 'info');
      onBack();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete ticket.', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading conversation thread & history...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Unable to Access Ticket</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Ticket not found or unauthorized.'}</p>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-2xl transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Queue</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Copy Ticket Details */}
          <button
            onClick={handleCopyTicketInfo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors shadow-xs"
            title="Copy ticket reference"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy Details'}</span>
          </button>

          {/* Delete Option for Owner or Agent */}
          {(isAgent || (ticket.user_id === user?.id && ticket.status === 'open')) && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  #{ticket.id}
                </span>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {ticket.subject}
              </h1>
            </div>

            {/* Author details */}
            <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5 bg-slate-50 p-3.5 sm:bg-transparent sm:p-0 rounded-2xl border border-slate-100 sm:border-0">
              <div className="text-[11px] text-slate-400">Customer</div>
              <div className="font-bold text-slate-800 text-sm">{ticket.customer_name}</div>
              <div className="font-mono text-[11px] text-slate-400">{ticket.customer_email}</div>
              <div className="flex items-center sm:justify-end gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Original Issue Description
            </h3>
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Agent Triage Controls (Agent Only) */}
          {isAgent && (
            <div className="bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-indigo-50/70 p-5 rounded-3xl border border-indigo-100/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Support Agent Triage Controls
                </h3>
                {triageSuccess && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-in fade-in">
                    <Check className="w-3 h-3" /> Changes Saved!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Update Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="w-full text-xs font-bold py-2 px-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none text-slate-800"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">Update Priority</label>
                  <select
                    value={priorityVal}
                    onChange={(e) => setPriorityVal(e.target.value)}
                    className="w-full text-xs font-bold py-2 px-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none text-slate-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Assignee with Quick Assign to Me */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-indigo-950">Assigned Engineer</label>
                    {assignedVal !== user?.id && (
                      <button
                        type="button"
                        onClick={handleAssignToMe}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                      >
                        <UserPlus className="w-3 h-3" /> Assign Me
                      </button>
                    )}
                  </div>
                  <select
                    value={assignedVal}
                    onChange={(e) => setAssignedVal(e.target.value)}
                    className="w-full text-xs font-medium py-2 px-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none text-slate-800"
                  >
                    <option value="">Unassigned (Open Queue)</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.email})
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
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingTriage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Triage Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discussion / Comments Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/20 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Responses & Resolution Thread ({comments.length})
          </h2>
          <span className="text-[11px] text-slate-400">Chronological conversation history</span>
        </div>

        <div className="p-6 space-y-6">
          {comments.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No replies on this ticket yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Submit a message below to start communicating.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                const isAgentComment = c.user_role === 'agent';
                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isAgentComment
                        ? 'bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-indigo-50/40 border-indigo-200 ml-4 sm:ml-10 shadow-xs'
                        : 'bg-slate-50/90 border-slate-200 mr-4 sm:mr-10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${
                            isAgentComment ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {c.user_name ? c.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{c.user_name}</span>
                          <span className="ml-2">
                            {isAgentComment ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" /> Support Team
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-md">
                                Customer
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pl-9">
                      {c.comment}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Reply Form */}
          <form onSubmit={handleAddComment} className="pt-5 border-t border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isAgent ? 'Post Official Support Response' : 'Reply to Support Team'}
              </h3>
              <span className="text-[11px] text-slate-400">
                {newComment.length} characters
              </span>
            </div>

            {/* Canned Responses for Agents */}
            {isAgent && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Canned Response Templates:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cannedResponses.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewComment(item.text)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {commentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{commentError}</span>
              </div>
            )}

            <textarea
              rows={3}
              placeholder={isAgent ? 'Type official resolution steps, questions, or status updates...' : 'Type your follow-up reply or extra information here...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none shadow-xs"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Response...</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Delete Ticket #{ticket.id}?</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Are you sure you want to permanently delete this ticket and all its discussion messages? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTicket}
                disabled={deleting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
