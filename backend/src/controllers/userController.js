const db = require('../config/db');

/**
 * GET /api/users
 * Retrieve users list (Agent access only)
 * Optionally filter by ?role=agent to populate assignment dropdowns
 */
async function getUsers(req, res) {
  try {
    const { role } = req.query;

    let sql = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (role && ['customer', 'agent'].includes(role.toLowerCase())) {
      sql += ' AND role = ?';
      params.push(role.toLowerCase());
    }

    sql += ' ORDER BY name ASC';

    const users = await db.query(sql, params);

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
}

module.exports = {
  getUsers
};
