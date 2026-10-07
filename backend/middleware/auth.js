const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Authentication is not configured' });
    const payload = jwt.verify(header.slice(7), secret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
    return next(error);
  }
}

module.exports = requireAuth;
