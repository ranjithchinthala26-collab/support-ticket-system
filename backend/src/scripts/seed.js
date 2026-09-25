const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  console.log('[Seed] Starting database seeding...');
  
  // Ensure tables exist
  await db.getPool();

  // Check if users already seeded
  const existingUsers = await db.query('SELECT COUNT(*) as count FROM users');
  const count = existingUsers[0].count || existingUsers[0]['COUNT(*)'] || 0;
  
  if (count > 0) {
    console.log(`[Seed] Database already contains ${count} users. Skipping user creation.`);
    return;
  }

  const customerPasswordHash = await bcrypt.hash('Customer123!', 10);
  const agentPasswordHash = await bcrypt.hash('Agent123!', 10);

  // 1. Insert Users
  await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['John Customer', 'customer@demo.com', customerPasswordHash, 'customer']
  );
  await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Alice Smith', 'alice@demo.com', customerPasswordHash, 'customer']
  );
  await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Bob Support Agent', 'agent@support.com', agentPasswordHash, 'agent']
  );
  await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Sarah Davis', 'sarah@support.com', agentPasswordHash, 'agent']
  );

  console.log('[Seed] Inserted 4 users (2 customers, 2 agents).');

  // Fetch inserted user IDs
  const users = await db.query('SELECT id, email, role FROM users');
  const john = users.find(u => u.email === 'customer@demo.com');
  const alice = users.find(u => u.email === 'alice@demo.com');
  const bob = users.find(u => u.email === 'agent@support.com');
  const sarah = users.find(u => u.email === 'sarah@support.com');

  // 2. Insert Sample Tickets
  const t1 = await db.query(
    `INSERT INTO tickets (user_id, subject, description, priority, status, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      john.id,
      'Payment gateway failing on checkout',
      'When attempting to complete credit card checkout via Stripe, an error code 502 occurs.',
      'urgent',
      'open',
      null
    ]
  );

  const t2 = await db.query(
    `INSERT INTO tickets (user_id, subject, description, priority, status, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      john.id,
      'Cannot update billing address',
      'In user profile settings, clicking Save Billing Address produces an invalid form error.',
      'medium',
      'in_progress',
      bob.id
    ]
  );

  const t3 = await db.query(
    `INSERT INTO tickets (user_id, subject, description, priority, status, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      john.id,
      'Feature Request: Dark mode theme',
      'Would love to have an automated dark theme option toggle in the portal navigation bar.',
      'low',
      'resolved',
      bob.id
    ]
  );

  const t4 = await db.query(
    `INSERT INTO tickets (user_id, subject, description, priority, status, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      alice.id,
      'Two-factor authentication SMS delayed',
      'SMS verification codes for login take over 10 minutes to arrive on mobile.',
      'high',
      'open',
      null
    ]
  );

  const t5 = await db.query(
    `INSERT INTO tickets (user_id, subject, description, priority, status, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      alice.id,
      'Export report to CSV not downloading',
      'Clicking the Export CSV button spins continuously without initiating the browser download.',
      'medium',
      'in_progress',
      sarah.id
    ]
  );

  console.log('[Seed] Inserted 5 sample tickets across varying priorities and statuses.');

  // 3. Insert Comments for ticket 2 & 3
  await db.query(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [t2.insertId, bob.id, 'Hello John, thank you for reaching out. Could you please specify which browser and operating system you are using?']
  );
  await db.query(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [t2.insertId, john.id, 'Hi Bob, I am running Google Chrome v128 on Windows 11.']
  );
  await db.query(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [t2.insertId, bob.id, 'Thanks! We identified a postal code regex validation issue and deployed a hotfix to staging. Please test and confirm.']
  );

  await db.query(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [t3.insertId, bob.id, 'Hi John, pleased to inform you that dark mode has been added in v2.4.0. Please verify!']
  );
  await db.query(
    'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
    [t3.insertId, john.id, 'Verified and looks fantastic! Thank you for the quick resolution.']
  );

  console.log('[Seed] Inserted 5 ticket comments.');
  console.log('[Seed] Database seeding completed successfully.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
