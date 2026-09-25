import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/TicketBadge';
import { TicketFormModal } from '../components/TicketFormModal';
import { 
  PlusCircle, 
  Search, 
  MessageSquare, 
  Calendar, 
  RotateCw, 
  Inbox, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const CustomerDashboard = ({ onSelectTicket }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await ticketApi.getTickets(params);
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleTicketCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  // Stats computation
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-200 bg-blue-600/40 px-3 py-1 rounded-full border border-blue-400/30">
            Customer Support Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            Track your ongoing requests, view agent responses, or raise a new ticket anytime.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-blue-900 bg-white hover:bg-blue-50 rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs text-slate-500 font-medium">Total Tickets</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{openCount}</div>
            <div className="text-xs text-slate-500 font-medium">Open</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600">{inProgressCount}</div>
            <div className="text-xs text-slate-500 font-medium">In Progress</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Resolved</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tickets by subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {['', 'open', 'in_progress', 'resolved'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  statusFilter === s ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'hover:text-slate-900'
                }`}
              >
                {s === '' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={fetchTickets}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh tickets"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            My Support Tickets ({tickets.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 text-sm">No tickets found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't submitted any tickets matching this filter. Click the button below to open a ticket.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Raise Ticket
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className="p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-400">#{ticket.id}</span>
                    <h3 className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors truncate">
                      {ticket.subject}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {ticket.comment_count || 0} comments
                    </span>
                    {ticket.assigned_agent_name && (
                      <span className="text-slate-600">
                        Assigned: <strong className="text-slate-800">{ticket.assigned_agent_name}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
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
