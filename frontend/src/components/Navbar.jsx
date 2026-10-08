import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LifeBuoy, 
  LogOut, 
  User, 
  ShieldCheck, 
  Database, 
  X, 
  Code2, 
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { ticketApi } from '../services/api';

export const Navbar = () => {
  const { user, logout, isAgent } = useAuth();
  const { showToast } = useToast();
  const [showQueryDemo, setShowQueryDemo] = useState(false);
  const [queryData, setQueryData] = useState(null);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchQueryDemo = async () => {
    setLoadingQuery(true);
    setShowQueryDemo(true);
    try {
      const res = await ticketApi.getExampleQuery();
      setQueryData(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load SQL demonstration data', 'error');
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleCopySql = () => {
    const sqlText = `SELECT 
    t.id AS ticket_id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.created_at,
    u.id AS customer_id,
    u.name AS customer_name,
    u.email AS customer_email
FROM tickets t
INNER JOIN users u ON t.user_id = u.id
WHERE t.status = 'open'
ORDER BY t.created_at DESC;`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    showToast('SQL query copied to clipboard!', 'info');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleLogout = () => {
    showToast('You have been signed out successfully.', 'info');
    logout();
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 transform hover:scale-105 transition-transform duration-200">
              <LifeBuoy className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 bg-clip-text text-transparent tracking-tight">
                  SupportHub
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60 shadow-xs">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                Ticket Management & Resolution System
              </p>
            </div>
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Requirement 8 Showcase Button */}
            <button
              onClick={fetchQueryDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-xl transition-all shadow-xs"
              title="Demonstrate Requirement 8: SQL JOIN & Filtering"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Requirement 8 SQL</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3 border-l border-slate-200/80 pl-3 sm:pl-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                    {isAgent ? (
                      <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 text-[10px]">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" /> Support Agent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 text-[10px]">
                        <User className="w-3 h-3 text-blue-600" /> Customer
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar with Initials */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Requirement 8 Demonstration Modal */}
      {showQueryDemo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] transform animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Requirement 8: SQL JOIN & Filtering</h3>
                  <p className="text-[11px] text-slate-500">Live parameterized query execution from MySQL database</p>
                </div>
              </div>
              <button 
                onClick={() => setShowQueryDemo(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assessment Specification</h4>
                <p className="text-xs text-slate-700 bg-blue-50/60 p-3 rounded-xl border border-blue-200/60 leading-relaxed">
                  "Write a query that returns all open tickets along with the customer's name and email. The query should demonstrate use of a JOIN and filtering."
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" /> Executed SQL Query
                  </h4>
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="text-xs bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono overflow-x-auto shadow-inner leading-relaxed border border-slate-800">
{`SELECT 
    t.id AS ticket_id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.created_at,
    u.id AS customer_id,
    u.name AS customer_name,
    u.email AS customer_email
FROM tickets t
INNER JOIN users u ON t.user_id = u.id
WHERE t.status = 'open'
ORDER BY t.created_at DESC;`}
                </pre>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" /> Query Results ({queryData?.count ?? 0} Open Tickets)
                </h4>

                {loadingQuery ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Executing SQL query against database...
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Ticket</th>
                          <th className="py-2.5 px-3">Subject</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {queryData?.data?.map((row) => (
                          <tr key={row.ticket_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-500">#{row.ticket_id}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{row.subject}</td>
                            <td className="py-2.5 px-3 text-slate-700">{row.customer_name}</td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{row.customer_email}</td>
                            <td className="py-2.5 px-3 capitalize font-bold text-rose-600">{row.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowQueryDemo(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
