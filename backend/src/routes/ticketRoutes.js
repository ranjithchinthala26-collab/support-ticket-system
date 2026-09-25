const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// All ticket endpoints require authentication
router.use(authenticateToken);

// Agent dashboard statistics (placed before :id route)
router.get('/stats/summary', authorizeRoles('agent'), ticketController.getStats);

// Ticket list: Customer sees own, Agent sees all
router.get('/', ticketController.getTickets);

// Ticket creation: Customer (and agents for testing)
router.post('/', ticketController.createTicket);

// Individual ticket CRUD
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

// Ticket comments
router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', commentController.addComment);

module.exports = router;
