const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Affiliate } = require('../utils/database');
const router = express.Router();

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET || 'rebelsrev-secret-2024', { expiresIn: '7d' });

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { [require('sequelize').Op.or]: [{ username }, { email: username }] }
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    let affiliateData = null;
    if (user.role === 'affiliate') {
      affiliateData = await Affiliate.findOne({ where: { user_id: user.id } });
    }

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role }, affiliate: affiliateData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'affiliate' } = req.body;
    const existingUser = await User.findOne({
      where: { [require('sequelize').Op.or]: [{ username }, { email }] }
    });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password_hash: hashed, role });

    const token = generateToken(newUser.id, newUser.role);
    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
