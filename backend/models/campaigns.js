const express = require('express');
const { Campaign } = require('../utils/database');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

console.log('authenticateToken:', authenticateToken); // Para verificar que no sea undefined

if (typeof authenticateToken !== 'function') {
  throw new Error('authenticateToken middleware is not a function! Check your import/export');
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
