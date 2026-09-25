import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketApi, userApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/TicketBadge';
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
  Filter, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const AgentDashboard = ({ onSelectTicket }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchData = async () => {
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

      setTickets(ticketsRes.data.tickets || []);
      setStats(statsRes.data.stats || {});
      setAgents(agentsRes.data.users || []);
    } catch (err) {
      console.error('Error loading agent dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Inline Status Update
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketApi.updateTicket(ticketId, { status: newStatus });
      // Update local state
      setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
      // Refresh stats
      const statsRes = await ticketApi.getStats();
      setStats(statsRes.data.stats);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign ticket.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Agent Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30 inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> Support Agent Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">
            Operations & Triage Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Logged in as <strong>{user?.name}</strong>. Monitor queue health, assign tickets, and triage incoming support inquiries.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all"
        >
          <RotateCw className="w-4 h-4 text-indigo-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total Tickets</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats?.total ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-amber-600 flex items-center justify-between">
            <span>Open (Pending)</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{stats?.open ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-indigo-600 flex items-center justify-between">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{stats?.in_progress ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-rose-600 flex items-center justify-between">
            <span>Urgent Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{stats?.urgent ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-600 flex items-center justify-between">
            <span>Unassigned</span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{stats?.unassigned ?? 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-emerald-600 flex items-center justify-between">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{stats?.resolved ?? 0}</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by subject, description, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
            />
          </form>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="created_at">Date Created</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Support Tickets ({tickets.length})
          </h2>
          <span className="text-xs text-slate-400">Click ticket row or 'Manage' to view thread</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading support tickets queue...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 text-sm">No tickets found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status (Quick Update)</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Subject */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 font-semibold">#{t.id}</span>
                        <div>
                          <div 
                            onClick={() => onSelectTicket(t.id)}
                            className="font-medium text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate max-w-xs"
                          >
                            {t.subject}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MessageSquare className="w-3 h-3" />
                            {t.comment_count || 0} comments
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{t.customer_name}</div>
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
                        className={`text-xs py-1 px-2.5 rounded-lg border font-medium outline-none focus:ring-2 ${
                          t.status === 'open'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : t.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : t.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    {/* Inline Assignment Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={t.assigned_to || ''}
                        onChange={(e) => handleAssignChange(t.id, e.target.value)}
                        className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Unassigned</option>
                        {agents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>

                    {/* Action Link */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectTicket(t.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <span>Manage</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
