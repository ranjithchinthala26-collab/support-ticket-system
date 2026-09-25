const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Support Ticket Management System API',
    timestamp: new Date().toISOString(),
    databaseMode: db.isSqlite() ? 'embedded-sqlite' : 'mysql'
  });
});

/**
 * Requirement 8: Example Database Query Endpoint
 * "Write a query that returns all open tickets along with the customer's name and email.
 * The query should demonstrate use of a JOIN and filtering."
 */
app.get('/api/example-query', async (req, res) => {
  try {
    const sql = `
      SELECT 
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
      ORDER BY t.created_at DESC
    `;
    const openTickets = await db.query(sql);

    res.status(200).json({
      success: true,
      description: 'Requirement 8: Open tickets joined with customer details',
      sql: sql.replace(/\s+/g, ' ').trim(),
      count: openTickets.length,
      data: openTickets
    });
  } catch (error) {
    console.error('Error running requirement 8 query:', error);
    res.status(500).json({ success: false, message: 'Failed to execute query.' });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
