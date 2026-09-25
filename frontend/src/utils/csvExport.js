/**
 * Export tickets array to a downloaded CSV file
 */
export function exportTicketsToCSV(tickets, filename = 'support-tickets-export.csv') {
  if (!tickets || tickets.length === 0) {
    alert('No tickets available to export.');
    return;
  }

  const headers = [
    'Ticket ID',
    'Subject',
    'Customer Name',
    'Customer Email',
    'Priority',
    'Status',
    'Assigned Agent',
    'Comments Count',
    'Created At',
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const text = String(str).replace(/"/g, '""');
    return `"${text}"`;
  };

  const rows = tickets.map((t) => [
    escapeCSV(t.id),
    escapeCSV(t.subject),
    escapeCSV(t.customer_name || 'N/A'),
    escapeCSV(t.customer_email || 'N/A'),
    escapeCSV(t.priority?.toUpperCase()),
    escapeCSV(t.status?.toUpperCase().replace('_', ' ')),
    escapeCSV(t.assigned_agent_name || 'Unassigned'),
    escapeCSV(t.comment_count || 0),
    escapeCSV(new Date(t.created_at).toLocaleString()),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
