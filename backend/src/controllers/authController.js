const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new customer account
 */
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Valid name is required.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = (role === 'agent') ? 'agent' : 'customer';

    // 2. Check if email already exists
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // 3. Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Insert into database
    const insertResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), password_hash, assignedRole]
    );

    const userId = insertResult.insertId;

    // 5. Generate JWT token
    const tokenPayload = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

/**
 * POST /api/auth/login
 * Authenticate customer or support agent
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user
    const users = await db.query(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

/**
 * GET /api/auth/me
 * Return current authenticated user profile
 */
async function getMe(req, res) {
  try {
    const users = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
}

module.exports = {
  register,
  login,
  getMe
};
