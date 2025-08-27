const express = require('express');
const { User, Affiliate } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const affiliates = await Affiliate.findAll({
      include: [{
        model: User,
        attributes: ['username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    const formattedAffiliates = affiliates.map(aff => ({
      ...aff.toJSON(),
      actualRevenue: aff.total_revenue,
      networkShare: parseFloat(aff.total_revenue) * 0.5,
      affiliateShare: aff.displayed_revenue
    }));
    
    res.json({ affiliates: formattedAffiliates });
  } catch (error) {
    console.error('Get affiliates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const affiliate = await Affiliate.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }
    
    if (req.user.role === 'affiliate' && affiliate.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let responseData = affiliate.toJSON();
    
    if (req.user.role === 'affiliate') {
      responseData = {
        ...responseData,
        total_revenue: affiliate.displayed_revenue,
        actualRevenue: undefined,
        networkShare: undefined
      };
    } else if (req.user.role === 'admin') {
      responseData = {
        ...responseData,
        actualRevenue: affiliate.total_revenue,
        networkShare: parseFloat(affiliate.total_revenue) * 0.5,
        affiliateShare: affiliate.displayed_revenue
      };
    }
    
    res.json(responseData);
  } catch (error) {
    console.error('Get affiliate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;