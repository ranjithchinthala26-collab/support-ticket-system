/**
 * Robust Client-Side Data Store
 * Provides instant persistence, pre-seeded sample data, and 100% fail-safe fallback
 * for seamless offline / frontend-only execution on Vercel or locally.
 */

const STORAGE_KEYS = {
  USERS: 'sh_mock_users',
  TICKETS: 'sh_mock_tickets',
  COMMENTS: 'sh_mock_comments',
  CURRENT_USER: 'support_user',
};

const DEFAULT_USERS = [
  { id: 1, name: 'John Customer', email: 'customer@demo.com', role: 'customer' },
  { id: 2, name: 'Alice Smith', email: 'alice@demo.com', role: 'customer' },
  { id: 3, name: 'Bob Support Agent', email: 'agent@support.com', role: 'agent' },
  { id: 4, name: 'Sarah Davis', email: 'sarah@support.com', role: 'agent' },
];

const DEFAULT_TICKETS = [
  {
    id: 1,
    user_id: 1,
    subject: 'Payment gateway failing on checkout',
    description: 'When attempting to complete credit card checkout via Stripe, an error code 502 occurs.',
    priority: 'urgent',
    status: 'open',
    assigned_to: null,
    created_at: '2026-09-24T10:30:00Z',
    updated_at: '2026-09-24T10:30:00Z',
    customer_name: 'John Customer',
    customer_email: 'customer@demo.com',
    assigned_agent_name: null,
    comment_count: 0,
  },
  {
    id: 2,
    user_id: 1,
    subject: 'Cannot update billing address',
    description: 'In user profile settings, clicking Save Billing Address produces an invalid form error.',
    priority: 'medium',
    status: 'in_progress',
    assigned_to: 3,
    created_at: '2026-09-24T11:15:00Z',
    updated_at: '2026-09-24T11:45:00Z',
    customer_name: 'John Customer',
    customer_email: 'customer@demo.com',
    assigned_agent_name: 'Bob Support Agent',
    comment_count: 3,
  },
  {
    id: 3,
    user_id: 1,
    subject: 'Feature Request: Dark mode theme',
    description: 'Would love to have an automated dark theme option toggle in the portal navigation bar.',
    priority: 'low',
    status: 'resolved',
    assigned_to: 3,
    created_at: '2026-09-23T14:20:00Z',
    updated_at: '2026-09-24T09:00:00Z',
    customer_name: 'John Customer',
    customer_email: 'customer@demo.com',
    assigned_agent_name: 'Bob Support Agent',
    comment_count: 2,
  },
  {
    id: 4,
    user_id: 2,
    subject: 'Two-factor authentication SMS delayed',
    description: 'SMS verification codes for login take over 10 minutes to arrive on mobile.',
    priority: 'high',
    status: 'open',
    assigned_to: null,
    created_at: '2026-09-24T08:00:00Z',
    updated_at: '2026-09-24T08:00:00Z',
    customer_name: 'Alice Smith',
    customer_email: 'alice@demo.com',
    assigned_agent_name: null,
    comment_count: 0,
  },
  {
    id: 5,
    user_id: 2,
    subject: 'Export report to CSV not downloading',
    description: 'Clicking the Export CSV button spins continuously without initiating the browser download.',
    priority: 'medium',
    status: 'in_progress',
    assigned_to: 4,
    created_at: '2026-09-24T09:45:00Z',
    updated_at: '2026-09-24T10:00:00Z',
    customer_name: 'Alice Smith',
    customer_email: 'alice@demo.com',
    assigned_agent_name: 'Sarah Davis',
    comment_count: 0,
  },
];

const DEFAULT_COMMENTS = [
  {
    id: 1,
    ticket_id: 2,
    user_id: 3,
    user_name: 'Bob Support Agent',
    user_role: 'agent',
    comment: 'Hello John, thank you for reaching out. Could you please specify which browser and operating system you are using?',
    created_at: '2026-09-24T11:20:00Z',
  },
  {
    id: 2,
    ticket_id: 2,
    user_id: 1,
    user_name: 'John Customer',
    user_role: 'customer',
    comment: 'Hi Bob, I am running Google Chrome v128 on Windows 11.',
    created_at: '2026-09-24T11:25:00Z',
  },
  {
    id: 3,
    ticket_id: 2,
    user_id: 3,
    user_name: 'Bob Support Agent',
    user_role: 'agent',
    comment: 'Thanks! We identified a postal code regex validation issue and deployed a hotfix to staging. Please test and confirm.',
    created_at: '2026-09-24T11:45:00Z',
  },
  {
    id: 4,
    ticket_id: 3,
    user_id: 3,
    user_name: 'Bob Support Agent',
    user_role: 'agent',
    comment: 'Hi John, pleased to inform you that dark mode has been added in v2.4.0. Please verify!',
    created_at: '2026-09-24T08:45:00Z',
  },
  {
    id: 5,
    ticket_id: 3,
    user_id: 1,
    user_name: 'John Customer',
    user_role: 'customer',
    comment: 'Verified and looks fantastic! Thank you for the quick resolution.',
    created_at: '2026-09-24T09:00:00Z',
  },
];

function getStored(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

// Current logged in user helper
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : DEFAULT_USERS[0];
  } catch {
    return DEFAULT_USERS[0];
  }
}

export const mockStore = {
  login: async ({ email }) => {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const normalizedEmail = (email || '').trim().toLowerCase();
    let matched = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!matched) {
      // Create user on the fly if not found so login never errors out
      const isAgent = normalizedEmail.includes('agent') || normalizedEmail.includes('admin');
      matched = {
        id: users.length + 1,
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: isAgent ? 'agent' : 'customer',
      };
      users.push(matched);
      setStored(STORAGE_KEYS.USERS, users);
    }

    const token = 'mock_jwt_token_' + Date.now();
    return {
      success: true,
      message: 'Login successful.',
      token,
      user: matched,
    };
  },

  register: async ({ name, email, role }) => {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const normalizedEmail = (email || '').trim().toLowerCase();
    let matched = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!matched) {
      matched = {
        id: users.length + 1,
        name: name || 'New Customer',
        email: normalizedEmail,
        role: role === 'agent' ? 'agent' : 'customer',
      };
      users.push(matched);
      setStored(STORAGE_KEYS.USERS, users);
    }

    const token = 'mock_jwt_token_' + Date.now();
    return {
      success: true,
      message: 'Account registered successfully.',
      token,
      user: matched,
    };
  },

  getMe: async () => {
    const user = getCurrentUser();
    return {
      success: true,
      user,
    };
  },

  getTickets: async (params = {}) => {
    const user = getCurrentUser();
    let tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);

    // Role-based customer scoping
    if (user?.role !== 'agent') {
      tickets = tickets.filter((t) => t.user_id === user?.id);
    }

    // Filter by status
    if (params.status) {
      tickets = tickets.filter((t) => t.status === params.status);
    }

    // Filter by priority
    if (params.priority) {
      tickets = tickets.filter((t) => t.priority === params.priority);
    }

    // Filter by search
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.customer_name && t.customer_name.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sortField = params.sortBy || 'created_at';
    const sortOrder = (params.sortOrder || 'DESC').toUpperCase();

    tickets.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
      if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

    return {
      success: true,
      count: tickets.length,
      tickets,
    };
  },

  getTicketById: async (id) => {
    const tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
    const ticket = tickets.find((t) => t.id === Number(id));
    if (!ticket) {
      return { success: false, message: 'Ticket not found.' };
    }
    return {
      success: true,
      ticket,
    };
  },

  createTicket: async (data) => {
    const user = getCurrentUser();
    const tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);

    const newTicket = {
      id: tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1,
      user_id: user?.id || 1,
      subject: data.subject,
      description: data.description,
      priority: data.priority || 'medium',
      status: 'open',
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_name: user?.name || 'John Customer',
      customer_email: user?.email || 'customer@demo.com',
      assigned_agent_name: null,
      comment_count: 0,
    };

    tickets.unshift(newTicket);
    setStored(STORAGE_KEYS.TICKETS, tickets);

    return {
      success: true,
      message: 'Support ticket submitted successfully.',
      ticket: newTicket,
    };
  },

  updateTicket: async (id, data) => {
    const tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
    const index = tickets.findIndex((t) => t.id === Number(id));
    if (index === -1) {
      return { success: false, message: 'Ticket not found.' };
    }

    const current = tickets[index];
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    let assignedName = current.assigned_agent_name;

    if (data.assigned_to !== undefined) {
      const agent = users.find((u) => u.id === Number(data.assigned_to));
      assignedName = agent ? agent.name : null;
    }

    const updated = {
      ...current,
      status: data.status || current.status,
      priority: data.priority || current.priority,
      assigned_to: data.assigned_to !== undefined ? data.assigned_to : current.assigned_to,
      assigned_agent_name: assignedName,
      updated_at: new Date().toISOString(),
    };

    tickets[index] = updated;
    setStored(STORAGE_KEYS.TICKETS, tickets);

    return {
      success: true,
      message: 'Ticket updated successfully.',
      ticket: updated,
    };
  },

  deleteTicket: async (id) => {
    let tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
    tickets = tickets.filter((t) => t.id !== Number(id));
    setStored(STORAGE_KEYS.TICKETS, tickets);

    let comments = getStored(STORAGE_KEYS.COMMENTS, DEFAULT_COMMENTS);
    comments = comments.filter((c) => c.ticket_id !== Number(id));
    setStored(STORAGE_KEYS.COMMENTS, comments);

    return {
      success: true,
      message: 'Ticket deleted successfully.',
    };
  },

  getStats: async () => {
    const tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
    return {
      success: true,
      stats: {
        total: tickets.length,
        open: tickets.filter((t) => t.status === 'open').length,
        in_progress: tickets.filter((t) => t.status === 'in_progress').length,
        resolved: tickets.filter((t) => t.status === 'resolved').length,
        closed: tickets.filter((t) => t.status === 'closed').length,
        urgent: tickets.filter((t) => t.priority === 'urgent').length,
        high: tickets.filter((t) => t.priority === 'high').length,
        unassigned: tickets.filter((t) => !t.assigned_to).length,
      },
    };
  },

  getComments: async (ticketId) => {
    const comments = getStored(STORAGE_KEYS.COMMENTS, DEFAULT_COMMENTS);
    const filtered = comments.filter((c) => c.ticket_id === Number(ticketId));
    return {
      success: true,
      count: filtered.length,
      comments: filtered,
    };
  },

  addComment: async (ticketId, commentText) => {
    const user = getCurrentUser();
    const comments = getStored(STORAGE_KEYS.COMMENTS, DEFAULT_COMMENTS);
    const tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);

    const newComment = {
      id: comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1,
      ticket_id: Number(ticketId),
      user_id: user?.id || 1,
      user_name: user?.name || 'Support User',
      user_role: user?.role || 'customer',
      comment: commentText,
      created_at: new Date().toISOString(),
    };

    comments.push(newComment);
    setStored(STORAGE_KEYS.COMMENTS, comments);

    // Update ticket comment count and status if agent replied
    const tIndex = tickets.findIndex((t) => t.id === Number(ticketId));
    if (tIndex !== -1) {
      tickets[tIndex].comment_count = (tickets[tIndex].comment_count || 0) + 1;
      tickets[tIndex].updated_at = new Date().toISOString();
      if (user?.role === 'agent' && tickets[tIndex].status === 'open') {
        tickets[tIndex].status = 'in_progress';
      }
      setStored(STORAGE_KEYS.TICKETS, tickets);
    }

    return {
      success: true,
      message: 'Comment posted successfully.',
      comment: newComment,
    };
  },

  getAgents: async () => {
    const users = getStored(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const agents = users.filter((u) => u.role === 'agent');
    return {
      success: true,
      users: agents,
    };
  },

  getExampleQuery: async () => {
    const tickets = getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS);
    const openTickets = tickets
      .filter((t) => t.status === 'open')
      .map((t) => ({
        ticket_id: t.id,
        subject: t.subject,
        description: t.description,
        priority: t.priority,
        status: t.status,
        created_at: t.created_at,
        customer_id: t.user_id,
        customer_name: t.customer_name,
        customer_email: t.customer_email,
      }));

    return {
      success: true,
      description: 'Requirement 8: Open tickets joined with customer details',
      sql: `SELECT t.id AS ticket_id, t.subject, t.description, t.priority, t.status, t.created_at, u.id AS customer_id, u.name AS customer_name, u.email AS customer_email FROM tickets t INNER JOIN users u ON t.user_id = u.id WHERE t.status = 'open' ORDER BY t.created_at DESC;`,
      count: openTickets.length,
      data: openTickets,
    };
  },
};
