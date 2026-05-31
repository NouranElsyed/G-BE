const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'port_dashboard_super_secret_key_2026';

/**
 * auth middleware
 * بيـ verify الـ JWT token ويحط user payload على req.user
 * لو مفيش token → 401
 */
const auth = (req, res, next) => {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: 0,
      messages: { type: 'error', texts: ['No token provided'] },
      result: null,
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;   // { userId, email, username, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({
      success: 0,
      messages: { type: 'error', texts: ['Invalid or expired token'] },
      result: null,
    });
  }
};

module.exports = auth;
