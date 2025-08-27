const express = require('express');
const { Click, Affiliate, Campaign } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { affiliateId, period = '30d' } = req.query;
    
    let whereClause = {};
    
    if (affiliateId) {
      if (req.user.role === 'affiliate') {
        const affiliate = await Affiliate.findOne({ where: { user_id: req.user.userId } });
        if (!affiliate || affiliate.id !== parseInt(affiliateId)) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
      whereClause.affiliate_id = parseInt(affiliateId);
    }
    
    // Filtrar por período
    const now = new Date();
    const periodMs = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    if (periodMs[period]) {
      const cutoffDate = new Date(now.getTime() - periodMs[period]);
      whereClause.clicked_at = {
        [require('sequelize').Op.gte]: cutoffDate
      };
    }
    
    const clicks = await Click.findAll({ where: whereClause });
    
    const totalClicks = clicks.length;
    const totalConversions = clicks.filter(c => c.is_converted).length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;
    const totalRevenue = clicks.reduce((sum, c) => sum + parseFloat(c.revenue), 0);
    
    res.json({
      period,
      totalClicks,
      totalConversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      affiliateRevenue: parseFloat((totalRevenue * 0.5).toFixed(2))
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;