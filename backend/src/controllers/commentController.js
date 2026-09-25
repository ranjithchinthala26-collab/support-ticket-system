const db = require('../config/db');

/**
 * GET /api/tickets/:id/comments
 * Retrieve all comments for a specific ticket.
 * Customer can access if they own the ticket; Agents can access any ticket's comments.
 */
async function getComments(req, res) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided.' });
    }

    // Verify ticket exists and check permissions
    const tickets = await db.query('SELECT id, user_id FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const ticket = tickets[0];
    if (req.user.role !== 'agent' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view comments for this ticket.'
      });
    }

    const commentsSql = `
      SELECT 
        c.id,
        c.ticket_id,
        c.user_id,
        c.comment,
        c.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role
      FROM ticket_comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.ticket_id = ?
      ORDER BY c.created_at ASC
    `;

    const comments = await db.query(commentsSql, [ticketId]);

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve comments.' });
  }
}

/**
 * POST /api/tickets/:id/comments
 * Add a new comment/response to a ticket.
 */
async function addComment(req, res) {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ticket ID provided.' });
    }

    const { comment } = req.body;
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    // Verify ticket exists
    const tickets = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const ticket = tickets[0];

    // Authorization
    if (req.user.role !== 'agent' && ticket.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to comment on this ticket.'
      });
    }

    // Insert comment
    const insertResult = await db.query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [ticketId, req.user.id, comment.trim()]
    );

    const newCommentId = insertResult.insertId;

    // If agent responds and ticket is currently open, automatically update status to in_progress
    if (req.user.role === 'agent' && ticket.status === 'open') {
      await db.query(
        "UPDATE tickets SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [ticketId]
      );
    }

    // Fetch newly created comment with author details
    const commentRows = await db.query(
      `SELECT 
        c.id,
        c.ticket_id,
        c.user_id,
        c.comment,
        c.created_at,
        u.name AS user_name,
        u.email AS user_email,
        u.role AS user_role
       FROM ticket_comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [newCommentId]
    );

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: commentRows[0]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
}

module.exports = {
  getComments,
  addComment
};
