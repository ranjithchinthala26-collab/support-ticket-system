const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_support_ticket_assessment_2026';

/**
 * Middleware: authenticateToken
 * Verifies JWT token from Authorization header and sets req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }

    req.user = decoded; // { id, name, email, role, iat, exp }
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
