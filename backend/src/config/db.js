const mysql = require('mysql2/promise');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let sqliteDb = null;
let isUsingSqlite = false;

// Determine connection strategy
const useMockOrTest = process.env.NODE_ENV === 'test' || process.env.USE_SQLITE === 'true';

async function initSqliteEngine() {
  if (sqliteDb) return sqliteDb;
  const SQL = await initSqlJs();
  sqliteDb = new SQL.Database();
  isUsingSqlite = true;

  // Initialize tables in SQLite for test/standalone mode
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to INTEGER NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return sqliteDb;
}

async function getPool() {
  if (useMockOrTest) {
    if (!sqliteDb) await initSqliteEngine();
    return null;
  }

  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'support_ticket_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000
    });

    // Test connection
    const connection = await pool.getConnection();
    connection.release();
    console.log(`[Database] Connected successfully to MySQL (${process.env.DB_HOST || 'localhost'})`);
    return pool;
  } catch (err) {
    console.warn(`[Database] MySQL connection failed (${err.message}). Falling back to embedded SQLite mode.`);
    await initSqliteEngine();
    return null;
  }
}

/**
 * Universal query runner: executes queries against MySQL or SQLite transparently
 * Supports parameterized queries with '?' placeholders
 */
async function query(sql, params = []) {
  if (!pool && !sqliteDb) {
    await getPool();
  }

  if (pool && !isUsingSqlite) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // SQLite execution
  if (!sqliteDb) {
    await initSqliteEngine();
  }

  const trimmed = sql.trim();
  const isSelect = trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA');

  if (isSelect) {
    const stmt = sqliteDb.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } else {
    // For INSERT, UPDATE, DELETE
    sqliteDb.run(sql, params);
    
    // Retrieve metadata
    let insertId = 0;
    let affectedRows = 0;

    if (trimmed.toUpperCase().startsWith('INSERT')) {
      const res = sqliteDb.exec("SELECT last_insert_rowid() AS id");
      if (res.length > 0 && res[0].values.length > 0) {
        insertId = res[0].values[0][0];
      }
    }

    const changesRes = sqliteDb.exec("SELECT changes() AS affected");
    if (changesRes.length > 0 && changesRes[0].values.length > 0) {
      affectedRows = changesRes[0].values[0][0];
    }

    return { insertId, affectedRows };
  }
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
}

module.exports = {
  getPool,
  query,
  close,
  initSqliteEngine,
  isSqlite: () => isUsingSqlite
};
