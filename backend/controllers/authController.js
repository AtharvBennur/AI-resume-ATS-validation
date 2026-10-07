const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ sub: user._id.toString() }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}

function validateCredentials(name, email, password, isRegistration = false) {
  const errors = {};
  if (isRegistration && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    errors.email = 'A valid email is required';
  }
  if (typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  return errors;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    const errors = validateCredentials(name, email, password, true);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'An account with this email already exists' });
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const errors = validateCredentials(undefined, email, password);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}

module.exports = { register, login, me };
