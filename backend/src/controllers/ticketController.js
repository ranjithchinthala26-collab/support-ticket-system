const db = require('../config/db');

/**
 * GET /api/tickets
 * Get tickets: Customers view their own; Support Agents view all.
 * Supports filtering (status, priority, search) and sorting.
 */
async function getTickets(req, res) {
  try {
    const { status, priority, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const isAgent = req.user.role === 'agent';

    let sql = `
      SELECT 
        t.id,
        t.user_id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email,
        a.name AS assigned_agent_name,
        a.email AS assigned_agent_email,
        (SELECT COUNT(*) FROM ticket_comments tc WHERE tc.ticket_id = t.id) AS comment_count
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1
    `;

    const params = [];

    // Role-based scoping: Customers can only access their own tickets
    if (!isAgent) {
      sql += ' AND t.user_id = ?';
      params.push(req.user.id);
    }

    // Filters
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status.toLowerCase())) {
      sql += ' AND t.status = ?';
      params.push(status.toLowerCase());
    }

    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority.toLowerCase())) {
      sql += ' AND t.priority = ?';
      params.push(priority.toLowerCase());
    }

    if (search && search.trim()) {
      sql += ' AND (t.subject LIKE ? OR t.description LIKE ? OR u.name LIKE ?)';
      const wildcard = `%${search.trim()}%`;
      params.push(wildcard, wildcard, wildcard);
    }

    // Sorting
    const allowedSortFields = {
      created_at: 't.created_at',
      updated_at: 't.updated_at',
      priority: 't.priority',
      status: 't.status',
      id: 't.id'
    };
    const sortField = allowedSortFields[sortBy] || 't.created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${sortField} ${direction}`;

    const tickets = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tickets.' });
  }
}

/**
 * GET /api/tickets/:id
 * Retrieve details for a specific ticket.
 * Customers can only access their own ticket; Agents can access any.
 */
async function getTicketById(req, res) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided.' });
    }

    const sql = `
      SELECT 
        t.id,
        t.user_id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email,
        a.name AS assigned_agent_name,
        a.email AS assigned_agent_email
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = ?
    `;

    const tickets = await db.query(sql, [ticketId]);

    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    // Authorization check
    if (req.user.role !== 'agent' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view another customer’s ticket.'
      });
    }

    return res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error fetching ticket by ID:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve ticket details.' });
  }
}

/**
 * POST /api/tickets
 * Create a new ticket (Customer capability)
 */
async function createTicket(req, res) {
  try {
    const { subject, description, priority = 'medium' } = req.body;

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Subject must be at least 3 characters long.' });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Description must be at least 5 characters long.' });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const chosenPriority = validPriorities.includes(priority.toLowerCase()) ? priority.toLowerCase() : 'medium';

    const insertResult = await db.query(
      `INSERT INTO tickets (user_id, subject, description, priority, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [req.user.id, subject.trim(), description.trim(), chosenPriority]
    );

    const newTicketId = insertResult.insertId;

    // Fetch newly created ticket with author details
    const newTickets = await db.query(
      `SELECT t.*, u.name AS customer_name, u.email AS customer_email
       FROM tickets t
       INNER JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [newTicketId]
    );

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully.',
      ticket: newTickets[0]
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ success: false, message: 'Failed to create ticket.' });
  }
}

/**
 * PUT /api/tickets/:id
 * Update ticket attributes.
 * Agents can update status, priority, and assigned_to agent.
 * Customers can update subject/description if ticket is open.
 */
async function updateTicket(req, res) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided.' });
    }

    const existingTickets = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (existingTickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const ticket = existingTickets[0];
    const isAgent = req.user.role === 'agent';
    const isOwner = ticket.user_id === req.user.id;

    if (!isAgent && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this ticket.'
      });
    }

    const { status, priority, assigned_to, subject, description } = req.body;

    const updates = [];
    const params = [];

    if (isAgent) {
      // Agent capabilities
      if (status !== undefined) {
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status.toLowerCase())) {
          return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }
        updates.push('status = ?');
        params.push(status.toLowerCase());
      }

      if (priority !== undefined) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority.toLowerCase())) {
          return res.status(400).json({ success: false, message: 'Invalid priority value.' });
        }
        updates.push('priority = ?');
        params.push(priority.toLowerCase());
      }

      if (assigned_to !== undefined) {
        if (assigned_to === null || assigned_to === '') {
          updates.push('assigned_to = NULL');
        } else {
          const agentId = parseInt(assigned_to, 10);
          // Verify assigned user is an agent
          const agentCheck = await db.query("SELECT id FROM users WHERE id = ? AND role = 'agent'", [agentId]);
          if (agentCheck.length === 0) {
            return res.status(400).json({ success: false, message: 'Assigned user must be a valid support agent.' });
          }
          updates.push('assigned_to = ?');
          params.push(agentId);
        }
      }
    }

    // Customer updates (allowed for open tickets)
    if (isOwner && ticket.status === 'open') {
      if (subject && subject.trim().length >= 3) {
        updates.push('subject = ?');
        params.push(subject.trim());
      }
      if (description && description.trim().length >= 5) {
        updates.push('description = ?');
        params.push(description.trim());
      }
      if (!isAgent && priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (validPriorities.includes(priority.toLowerCase())) {
          updates.push('priority = ?');
          params.push(priority.toLowerCase());
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid update fields provided.' });
    }

    // Update timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');

    const updateSql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    params.push(ticketId);

    await db.query(updateSql, params);

    // Fetch updated ticket with full metadata
    const updatedTickets = await db.query(
      `SELECT 
        t.*,
        u.name AS customer_name,
        u.email AS customer_email,
        a.name AS assigned_agent_name,
        a.email AS assigned_agent_email
       FROM tickets t
       INNER JOIN users u ON t.user_id = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [ticketId]
    );

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      ticket: updatedTickets[0]
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return res.status(500).json({ success: false, message: 'Failed to update ticket.' });
  }
}

/**
 * DELETE /api/tickets/:id
 * Delete ticket: Agent can delete any; Customer can delete own open ticket.
 */
async function deleteTicket(req, res) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided.' });
    }

    const existingTickets = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (existingTickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const ticket = existingTickets[0];
    const isAgent = req.user.role === 'agent';
    const isOwner = ticket.user_id === req.user.id;

    if (!isAgent && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this ticket.'
      });
    }

    // Customers can only delete their ticket if still open
    if (!isAgent && ticket.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Customers cannot delete tickets that are already in progress or resolved.'
      });
    }

    // Delete ticket (database cascades to ticket_comments)
    await db.query('DELETE FROM ticket_comments WHERE ticket_id = ?', [ticketId]);
    await db.query('DELETE FROM tickets WHERE id = ?', [ticketId]);

    return res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete ticket.' });
  }
}

/**
 * GET /api/tickets/stats/summary
 * Support Agent Dashboard statistics
 */
async function getStats(req, res) {
  try {
    const totalResult = await db.query('SELECT COUNT(*) AS total FROM tickets');
    const openResult = await db.query("SELECT COUNT(*) AS open FROM tickets WHERE status = 'open'");
    const inProgressResult = await db.query("SELECT COUNT(*) AS in_progress FROM tickets WHERE status = 'in_progress'");
    const resolvedResult = await db.query("SELECT COUNT(*) AS resolved FROM tickets WHERE status = 'resolved'");
    const closedResult = await db.query("SELECT COUNT(*) AS closed FROM tickets WHERE status = 'closed'");
    const urgentResult = await db.query("SELECT COUNT(*) AS urgent FROM tickets WHERE priority = 'urgent'");
    const highResult = await db.query("SELECT COUNT(*) AS high FROM tickets WHERE priority = 'high'");
    const unassignedResult = await db.query('SELECT COUNT(*) AS unassigned FROM tickets WHERE assigned_to IS NULL');

    return res.status(200).json({
      success: true,
      stats: {
        total: totalResult[0]?.total || 0,
        open: openResult[0]?.open || 0,
        in_progress: inProgressResult[0]?.in_progress || 0,
        resolved: resolvedResult[0]?.resolved || 0,
        closed: closedResult[0]?.closed || 0,
        urgent: urgentResult[0]?.urgent || 0,
        high: highResult[0]?.high || 0,
        unassigned: unassignedResult[0]?.unassigned || 0
      }
    });
  } catch (error) {
    console.error('Error fetching ticket statistics:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve ticket statistics.' });
  }
}

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getStats
};
