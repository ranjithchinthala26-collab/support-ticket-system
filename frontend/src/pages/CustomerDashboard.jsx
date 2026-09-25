import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ticketApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/TicketBadge';
import { TicketFormModal } from '../components/TicketFormModal';
import { exportTicketsToCSV } from '../utils/csvExport';
import { 
  PlusCircle, 
  Search, 
  MessageSquare, 
  Calendar, 
  RotateCw, 
  Inbox, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  X,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const CustomerDashboard = ({ onSelectTicket }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async (isManualRefresh = false) => {
    setLoading(true);
    try {
      const params = {
        sortBy,
        sortOrder,
      };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();

      const res = await ticketApi.getTickets(params);
      setTickets(res.data.tickets || []);
      if (isManualRefresh) {
        showToast('Tickets refreshed successfully.', 'info');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      showToast('Failed to fetch support tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleClearSearch = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const handleTicketCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  const handleExportCSV = () => {
    exportTicketsToCSV(tickets, `my-support-tickets-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast(`Exported ${tickets.length} tickets to CSV!`, 'success');
  };

  // Stats computation
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-bold tracking-wider uppercase text-blue-200 bg-blue-500/30 px-3.5 py-1 rounded-full border border-blue-300/30 inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" /> Customer Support Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2.5">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl leading-relaxed">
            Raise technical inquiries, track live engineer responses, and monitor your resolution progress.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-blue-900 bg-white hover:bg-blue-50 rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 ring-2 ring-white/20"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>Raise New Ticket</span>
          </button>
        </div>
      </div>

      {/* Interactive KPI Stats Cards (Clickable Quick Filters) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* All Tickets */}
        <div 
          onClick={() => setStatusFilter('')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === '' 
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-md' 
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalCount}</div>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Click to view all</span>
        </div>

        {/* Open */}
        <div 
          onClick={() => setStatusFilter('open')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === 'open' 
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-md' 
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Open</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{openCount}</div>
          <span className="text-[11px] text-amber-600/80 font-medium mt-0.5 block">Awaiting response</span>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => setStatusFilter('in_progress')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === 'in_progress' 
              ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20 shadow-md' 
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">{inProgressCount}</div>
          <span className="text-[11px] text-indigo-600/80 font-medium mt-0.5 block">Being investigated</span>
        </div>

        {/* Resolved */}
        <div 
          onClick={() => setStatusFilter('resolved')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-0.5 ${
            statusFilter === 'resolved' 
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md' 
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Resolved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{resolvedCount}</div>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-0.5 block">Completed inquiries</span>
        </div>
      </div>

      {/* Search, Filter & Export Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by ticket subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchTickets(); }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Quick Selectors & Export */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 font-medium"
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
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-700 font-medium"
              >
                <option value="created_at">Date Created</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-xs"
              title="Download tickets as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={() => fetchTickets(true)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              title="Refresh tickets"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Status:
          </span>
          {[
            { id: '', label: 'All Tickets' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'closed', label: 'Closed' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === pill.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
          {(statusFilter || priorityFilter || search) && (
            <button
              onClick={handleClearSearch}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline ml-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/20">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Your Support Inquiries ({tickets.length})
          </h2>
          <span className="text-[11px] text-slate-400">Click any card to view thread and reply</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Fetching support tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center text-slate-500 px-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No tickets found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              No tickets matched your current search and filter settings. Try adjusting your filters or raise a new ticket.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(statusFilter || priorityFilter || search) && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise Ticket</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className="p-5 hover:bg-blue-50/40 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                      #{ticket.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                      {ticket.subject}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl leading-relaxed">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {ticket.comment_count || 0} comments
                    </span>
                    {ticket.assigned_agent_name ? (
                      <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                        Agent: {ticket.assigned_agent_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned (Queued)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                  <div className="p-1 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Create Modal */}
      <TicketFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};
