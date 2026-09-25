import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ticketApi, userApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/TicketBadge';
import { exportTicketsToCSV } from '../utils/csvExport';
import { 
  Shield, 
  Search, 
  RotateCw, 
  Inbox, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck, 
  Download,
  ExternalLink,
  MessageSquare,
  X,
  UserPlus,
  Trash2
} from 'lucide-react';

export const AgentDashboard = ({ onSelectTicket }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState(''); // '' | 'unassigned' | 'me'
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Delete modal state
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async (isManualRefresh = false) => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        sortOrder,
      };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();

      const [ticketsRes, statsRes, agentsRes] = await Promise.all([
        ticketApi.getTickets(params),
        ticketApi.getStats(),
        userApi.getAgents(),
      ]);

      let loadedTickets = ticketsRes.data.tickets || [];

      // Apply client-side assignedFilter if selected
      if (assignedFilter === 'unassigned') {
        loadedTickets = loadedTickets.filter((t) => !t.assigned_to);
      } else if (assignedFilter === 'me') {
        loadedTickets = loadedTickets.filter((t) => t.assigned_to === user?.id);
      }

      setTickets(loadedTickets);
      setStats(statsRes.data.stats || {});
      setAgents(agentsRes.data.users || []);

      if (isManualRefresh) {
        showToast('Ticket queue and statistics refreshed.', 'info');
      }
    } catch (err) {
      console.error('Error loading agent dashboard data:', err);
      showToast('Failed to refresh tickets queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, assignedFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setAssignedFilter('');
  };

  // Inline Status Update
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketApi.updateTicket(ticketId, { status: newStatus });
      setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
      showToast(`Ticket #${ticketId} status updated to ${newStatus.toUpperCase().replace('_', ' ')}`, 'success');
      const statsRes = await ticketApi.getStats();
      setStats(statsRes.data.stats);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  // Inline Assignment Update
  const handleAssignChange = async (ticketId, agentId) => {
    try {
      const val = agentId === '' ? null : parseInt(agentId, 10);
      await ticketApi.updateTicket(ticketId, { assigned_to: val });
      const assignedObj = agents.find((a) => a.id === val);
      setTickets(
        tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                assigned_to: val,
                assigned_agent_name: assignedObj ? assignedObj.name : null,
              }
            : t
        )
      );
      showToast(`Ticket #${ticketId} assigned to ${assignedObj ? assignedObj.name : 'Unassigned'}`, 'success');
      const statsRes = await ticketApi.getStats();
      setStats(statsRes.data.stats);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign ticket.', 'error');
    }
  };

  // Quick 1-click Assign to Me
  const handleAssignToMe = async (ticketId) => {
    await handleAssignChange(ticketId, user.id);
  };

  // Delete ticket confirmation & action
  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setDeleting(true);
    try {
      await ticketApi.deleteTicket(ticketToDelete.id);
      setTickets(tickets.filter((t) => t.id !== ticketToDelete.id));
      showToast(`Ticket #${ticketToDelete.id} deleted successfully.`, 'info');
      setTicketToDelete(null);
      const statsRes = await ticketApi.getStats();
      setStats(statsRes.data.stats);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete ticket.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    exportTicketsToCSV(tickets, `support-tickets-queue-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast(`Exported ${tickets.length} tickets to CSV!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Agent Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-bold tracking-wider uppercase text-indigo-300 bg-indigo-500/20 px-3.5 py-1 rounded-full border border-indigo-400/30 inline-flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> Support Agent Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2.5">
            Operations & Triage Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Logged in as <strong className="text-white">{user?.name}</strong>. Monitor incoming queues, assign engineers, triage priorities, and manage ticket lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-white rounded-xl shadow-md transition-all"
            title="Export current tickets to CSV"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => fetchData(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all"
            title="Refresh queue"
          >
            <RotateCw className="w-4 h-4" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar (Interactive Clickable Quick Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div 
          onClick={handleClearFilters}
          className={`p-4 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === '' && priorityFilter === '' && assignedFilter === ''
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between opacity-80">
            <span>Total Tickets</span>
            <Inbox className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-2">{stats?.total ?? 0}</div>
          <span className="text-[10px] opacity-60 block mt-0.5 font-medium">Click to show all</span>
        </div>

        {/* Open */}
        <div 
          onClick={() => { setStatusFilter('open'); setPriorityFilter(''); setAssignedFilter(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === 'open'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-500/30'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
            statusFilter === 'open' ? 'text-white' : 'text-amber-700'
          }`}>
            <span>Open (Pending)</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black mt-2 ${statusFilter === 'open' ? 'text-white' : 'text-amber-600'}`}>
            {stats?.open ?? 0}
          </div>
          <span className={`text-[10px] block mt-0.5 font-medium ${statusFilter === 'open' ? 'text-white/80' : 'text-amber-600/80'}`}>
            Needs investigation
          </span>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => { setStatusFilter('in_progress'); setPriorityFilter(''); setAssignedFilter(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === 'in_progress'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
            statusFilter === 'in_progress' ? 'text-white' : 'text-indigo-700'
          }`}>
            <span>In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black mt-2 ${statusFilter === 'in_progress' ? 'text-white' : 'text-indigo-600'}`}>
            {stats?.in_progress ?? 0}
          </div>
          <span className={`text-[10px] block mt-0.5 font-medium ${statusFilter === 'in_progress' ? 'text-white/80' : 'text-indigo-600/80'}`}>
            Active triage
          </span>
        </div>

        {/* Urgent */}
        <div 
          onClick={() => { setPriorityFilter('urgent'); setStatusFilter(''); setAssignedFilter(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            priorityFilter === 'urgent'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30 animate-pulse'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
            priorityFilter === 'urgent' ? 'text-white' : 'text-rose-700'
          }`}>
            <span>Urgent Priority</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black mt-2 ${priorityFilter === 'urgent' ? 'text-white' : 'text-rose-600'}`}>
            {stats?.urgent ?? 0}
          </div>
          <span className={`text-[10px] block mt-0.5 font-medium ${priorityFilter === 'urgent' ? 'text-white/80' : 'text-rose-600/80'}`}>
            High SLA risk
          </span>
        </div>

        {/* Unassigned */}
        <div 
          onClick={() => { setAssignedFilter('unassigned'); setStatusFilter(''); setPriorityFilter(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            assignedFilter === 'unassigned'
              ? 'bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-500/30'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
            assignedFilter === 'unassigned' ? 'text-white' : 'text-slate-700'
          }`}>
            <span>Unassigned</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black mt-2 ${assignedFilter === 'unassigned' ? 'text-white' : 'text-slate-800'}`}>
            {stats?.unassigned ?? 0}
          </div>
          <span className={`text-[10px] block mt-0.5 font-medium ${assignedFilter === 'unassigned' ? 'text-white/80' : 'text-slate-500'}`}>
            Needs owner
          </span>
        </div>

        {/* Resolved */}
        <div 
          onClick={() => { setStatusFilter('resolved'); setPriorityFilter(''); setAssignedFilter(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === 'resolved'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
            statusFilter === 'resolved' ? 'text-white' : 'text-emerald-700'
          }`}>
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-black mt-2 ${statusFilter === 'resolved' ? 'text-white' : 'text-emerald-600'}`}>
            {stats?.resolved ?? 0}
          </div>
          <span className={`text-[10px] block mt-0.5 font-medium ${statusFilter === 'resolved' ? 'text-white/80' : 'text-emerald-600/80'}`}>
            Completed
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by subject, description, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchData(); }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 font-medium text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 font-medium text-slate-700"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 font-medium text-slate-700"
              >
                <option value="created_at">Date Created</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>

            {(statusFilter || priorityFilter || assignedFilter || search) && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline px-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/20">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Global Support Tickets Queue ({tickets.length})
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click ticket row or 'Manage' to open discussion thread & triage
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            {tickets.length} Active Rows
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Synchronizing support tickets queue...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center text-slate-500 px-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No matching tickets</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              No tickets matched the current filter criteria. Click below to clear all filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status (Quick Update)</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* ID & Subject */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 font-bold">#{t.id}</span>
                        <div>
                          <div 
                            onClick={() => onSelectTicket(t.id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate max-w-xs"
                          >
                            {t.subject}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>{t.comment_count || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{t.customer_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{t.customer_email}</div>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={t.priority} />
                    </td>

                    {/* Inline Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className={`text-xs py-1.5 px-2.5 rounded-xl border font-bold outline-none focus:ring-2 cursor-pointer transition-colors ${
                          t.status === 'open'
                            ? 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-blue-200'
                            : t.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-200'
                            : t.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300 focus:ring-slate-200'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    {/* Inline Assignment Dropdown with Assign to Me */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={t.assigned_to || ''}
                          onChange={(e) => handleAssignChange(t.id, e.target.value)}
                          className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 font-medium"
                        >
                          <option value="">Unassigned</option>
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.name}
                            </option>
                          ))}
                        </select>
                        {t.assigned_to !== user?.id && (
                          <button
                            type="button"
                            onClick={() => handleAssignToMe(t.id)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200/80"
                            title="Assign this ticket to me"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>

                    {/* Action Links */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectTicket(t.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-all shadow-xs"
                        >
                          <span>Manage</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setTicketToDelete(t)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-lg">Delete Ticket #{ticketToDelete.id}?</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Are you sure you want to delete <strong className="text-slate-800">"{ticketToDelete.subject}"</strong>? All associated replies will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
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
