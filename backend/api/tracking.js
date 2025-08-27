const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Click, Affiliate, Campaign } = require('../utils/database');
const { applyRevenueSplit } = require('../utils/revenue-split');
const router = express.Router();

router.post('/generate-link', async (req, res) => {
  try {
    const { affiliateId, campaignId, subId } = req.body;
    
    const trackingId = uuidv4();
    const baseUrl = process.env.TRACKING_DOMAIN || 'https://track.rebelsrev.com';
    const trackingUrl = `${baseUrl}/t/${trackingId}?aff=${affiliateId}&camp=${campaignId}&sub=${subId || ''}`;
    
    res.json({
      trackingId,
      trackingUrl,
      affiliateId,
      campaignId,
      subId: subId || null,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate tracking link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/click/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { aff: affiliateId, camp: campaignId, sub: subId } = req.query;
    
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const clickData = await Click.create({
      tracking_id: trackingId,
      affiliate_id: parseInt(affiliateId),
      campaign_id: parseInt(campaignId),
      sub_id: subId,
      ip_address: ip,
      user_agent: userAgent,
      country: 'US' // Placeholder
    });
    
    // Obtener URL de redirección de la campaña
    const campaign = await Campaign.findByPk(campaignId);
    const redirectUrl = campaign?.redirect_url || 'https://example-offer.com';
    
    res.json({
      success: true,
      clickId: clickData.id,
      redirectUrl,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conversion', async (req, res) => {
  try {
    const { clickId, revenue, conversionType = 'lead' } = req.body;
    
    const click = await Click.findByPk(clickId);
    if (!click || click.is_converted) {
      return res.status(400).json({ error: 'Invalid or already converted click' });
    }
    
    const { networkRevenue, affiliateRevenue } = applyRevenueSplit(revenue);
    
    // Actualizar click
    await click.update({
      is_converted: true,
      revenue: revenue
    });
    
    // Actualizar estadísticas del afiliado
    const affiliate = await Affiliate.findByPk(click.affiliate_id);
    if (affiliate) {
      await affiliate.update({
        total_revenue: parseFloat(affiliate.total_revenue) + revenue,
        displayed_revenue: parseFloat(affiliate.displayed_revenue) + affiliateRevenue,
        pending_payment: parseFloat(affiliate.pending_payment) + affiliateRevenue,
        total_conversions: affiliate.total_conversions + 1
      });
    }
    
    res.json({
      success: true,
      totalRevenue: revenue,
      affiliateRevenue,
      message: 'Conversion tracked successfully'
    });
  } catch (error) {
    console.error('Track conversion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;