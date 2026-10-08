const app = require('../backend/src/app');
const db = require('../backend/src/config/db');
const { seedDatabase } = require('../backend/src/scripts/seed');

let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    try {
      await db.getPool();
      await seedDatabase();
    } catch (err) {
      console.warn('[Vercel Serverless Init Warning]:', err.message);
    }
    isInitialized = true;
  }
}

module.exports = async (req, res) => {
  await ensureInitialized();
  return app(req, res);
};
