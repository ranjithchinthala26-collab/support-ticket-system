const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const db = require('./config/db');
const { seedDatabase } = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database pool
    await db.getPool();

    // Auto-seed sample data if empty
    await seedDatabase();

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(` Support Ticket Management System Backend API`);
      console.log(` Running on: http://localhost:${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(` Database Mode: ${db.isSqlite() ? 'SQLite Fallback' : 'MySQL'}`);
      console.log('====================================================');
      console.log(' Demo Credentials:');
      console.log('  - Customer: customer@demo.com / Customer123!');
      console.log('  - Agent:    agent@support.com  / Agent123!');
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
