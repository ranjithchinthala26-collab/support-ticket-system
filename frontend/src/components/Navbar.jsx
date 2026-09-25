import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LifeBuoy, 
  LogOut, 
  User, 
  ShieldCheck, 
  Database, 
  X, 
  Code2, 
  Layers
} from 'lucide-react';
import axios from 'axios';

export const Navbar = ({ onOpenQueryModal }) => {
  const { user, logout, isAgent } = useAuth();
  const [showQueryDemo, setShowQueryDemo] = useState(false);
  const [queryData, setQueryData] = useState(null);
  const [loadingQuery, setLoadingQuery] = useState(false);

  const fetchQueryDemo = async () => {
    setLoadingQuery(true);
    setShowQueryDemo(true);
    try {
      const res = await axios.get('/api/example-query');
      setQueryData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuery(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">SupportHub</span>
              <span className="ml-2 hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                Ticket Management
              </span>
            </div>
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Requirement 8 Showcase Button */}
            <button
              onClick={fetchQueryDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              title="Demonstrate Requirement 8: SQL JOIN & Filtering"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">SQL Join Demo</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-3 sm:pl-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                    {isAgent ? (
                      <span className="inline-flex items-center gap-0.5 text-indigo-600 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Support Agent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-slate-600 font-medium">
                        <User className="w-3 h-3" /> Customer
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Requirement 8: SQL JOIN & Filtering Query</h3>
              </div>
              <button 
                onClick={() => setShowQueryDemo(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Requirement Statement</h4>
                <p className="text-xs text-slate-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  "Write a query that returns all open tickets along with the customer's name and email. The query should demonstrate use of a JOIN and filtering."
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-600" /> Executed SQL Statement
                </h4>
                <pre className="text-xs bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono overflow-x-auto shadow-inner leading-relaxed">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-600" /> Live Query Output ({queryData?.count ?? 0} Open Tickets)
                </h4>

                {loadingQuery ? (
                  <div className="py-6 text-center text-xs text-slate-500">Executing database query...</div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Ticket ID</th>
                          <th className="py-2 px-3">Subject</th>
                          <th className="py-2 px-3">Customer</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {queryData?.data?.map((row) => (
                          <tr key={row.ticket_id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-medium text-slate-600">#{row.ticket_id}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{row.subject}</td>
                            <td className="py-2 px-3 text-slate-700">{row.customer_name}</td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{row.customer_email}</td>
                            <td className="py-2 px-3 capitalize font-semibold text-rose-600">{row.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowQueryDemo(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
