const app = require('../backend/src/app');
const db = require('../backend/src/config/db');
const { seedDatabase } = require('../backend/src/scripts/seed');

let initPromise = null;

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('[Serverless Init] Initializing database...');
        await db.getPool();
        console.log('[Serverless Init] Database connected. Checking seed status...');
        await seedDatabase();
        console.log('[Serverless Init] Initialization completed successfully.');
      } catch (err) {
        console.error('[Serverless Init Error]:', err);
        // Allow retry on future requests if initialization fails
        initPromise = null;
        throw err;
      }
    })();
  }
  return initPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureInitialized();
  } catch (err) {
    console.error('[Request Handler Warning]:', err.message);
  }
  return app(req, res);
};
