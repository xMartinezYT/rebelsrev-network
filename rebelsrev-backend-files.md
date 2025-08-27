# 🔧 BACKEND - Archivos Completos para Vercel

## backend/package.json
```json
{
  "name": "rebelsrev-backend",
  "version": "1.0.0",
  "description": "RebelsRev Network API - Revolutionary Affiliate Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "npm install"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "sequelize": "^6.32.1",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.0",
    "geoip-lite": "^1.4.7",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1"
  },
  "engines": {
    "node": "18.x"
  }
}
```

## backend/vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## backend/server.js
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
const { initializeDatabase } = require('./utils/database');

// Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/affiliates', require('./api/affiliates'));
app.use('/api/campaigns', require('./api/campaigns'));
app.use('/api/tracking', require('./api/tracking'));
app.use('/api/stats', require('./api/stats'));

// Migration and seed endpoints (for initial setup)
app.get('/api/migrate', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ message: '🔥 Database migrated successfully!' });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
});

app.get('/api/seed', async (req, res) => {
  try {
    const { seedDatabase } = require('./utils/database');
    await seedDatabase();
    res.json({ message: '🌱 Database seeded successfully!' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Seed failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🔥 RebelsRev API is running!',
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🔥 RebelsRev Network API',
    version: '1.0.0',
    status: 'Revolutionary!'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🔥 RebelsRev API running on port ${PORT}`);
  });
}

module.exports = app;
```

## backend/utils/database.js
```javascript
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

let sequelize;

// Configurar conexión
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false
  });
} else {
  // Fallback a SQLite para desarrollo
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
}

// Definir modelos
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'affiliate'),
    defaultValue: 'affiliate'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

const Affiliate = sequelize.define('Affiliate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  sub_id: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'banned'),
    defaultValue: 'active'
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0.5000
  },
  total_clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  displayed_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  pending_payment: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  join_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  last_activity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'affiliates',
  timestamps: true
});

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('sweeps', 'mobile_content', 'pin_submit', 'dating', 'finance'),
    allowNull: false
  },
  payout: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'paused'),
    defaultValue: 'active'
  },
  geo: {
    type: DataTypes.STRING(500)
  },
  description: {
    type: DataTypes.TEXT
  },
  redirect_url: {
    type: DataTypes.STRING(500)
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  network_share: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  affiliate_share: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'campaigns',
  timestamps: true
});

const Click = sequelize.define('Click', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tracking_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    defaultValue: DataTypes.UUIDV4
  },
  affiliate_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  campaign_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sub_id: {
    type: DataTypes.STRING(50)
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.TEXT
  },
  country: {
    type: DataTypes.STRING(2)
  },
  is_converted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  revenue: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00
  },
  clicked_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'clicks',
  timestamps: false
});

// Asociaciones
User.hasOne(Affiliate, { foreignKey: 'user_id' });
Affiliate.belongsTo(User, { foreignKey: 'user_id' });

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔥 Database connection established');
    
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    return true;
  } catch (error) {
    console.error('❌ Database error:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Crear usuario admin
    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@rebelsrev.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });
    
    // Crear usuarios afiliados
    const [rebelCarlos] = await User.findOrCreate({
      where: { username: 'rebel_carlos' },
      defaults: {
        username: 'rebel_carlos',
        email: 'carlos@rebelsrev.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'affiliate'
      }
    });
    
    const [stormMaria] = await User.findOrCreate({
      where: { username: 'storm_maria' },
      defaults: {
        username: 'storm_maria',
        email: 'maria@rebelsrev.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'affiliate'
      }
    });
    
    // Crear afiliados
    await Affiliate.findOrCreate({
      where: { user_id: rebelCarlos.id },
      defaults: {
        user_id: rebelCarlos.id,
        name: 'Carlos Rebel',
        email: 'carlos@rebelsrev.com',
        sub_id: 'REV001',
        status: 'active',
        total_clicks: 15420,
        total_conversions: 892,
        total_revenue: 17840.00,
        displayed_revenue: 8920.00,
        pending_payment: 8920.00
      }
    });
    
    await Affiliate.findOrCreate({
      where: { user_id: stormMaria.id },
      defaults: {
        user_id: stormMaria.id,
        name: 'María Storm',
        email: 'maria@rebelsrev.com',
        sub_id: 'REV002',
        status: 'active',
        total_clicks: 8950,
        total_conversions: 445,
        total_revenue: 8900.00,
        displayed_revenue: 4450.00,
        pending_payment: 4450.00
      }
    });
    
    // Crear campañas
    await Campaign.findOrCreate({
      where: { name: 'iPhone 15 Revolution' },
      defaults: {
        name: 'iPhone 15 Revolution',
        type: 'sweeps',
        payout: 2.50,
        status: 'active',
        geo: 'US,CA,UK',
        description: 'Revolutionary iPhone giveaway for rebels',
        redirect_url: 'https://iphone-revolution.example.com',
        total_revenue: 15600.00,
        network_share: 7800.00,
        affiliate_share: 7800.00
      }
    });
    
    await Campaign.findOrCreate({
      where: { name: 'Mobile Rebellion - Premium Apps' },
      defaults: {
        name: 'Mobile Rebellion - Premium Apps',
        type: 'mobile_content',
        payout: 1.80,
        status: 'active',
        geo: 'US,AU,DE',
        description: 'Premium app revolution for mobile warriors',
        redirect_url: 'https://mobile-rebellion.example.com',
        total_revenue: 12400.00,
        network_share: 6200.00,
        affiliate_share: 6200.00
      }
    });
    
    await Campaign.findOrCreate({
      where: { name: 'Credit Storm - PIN Submit' },
      defaults: {
        name: 'Credit Storm - PIN Submit',
        type: 'pin_submit',
        payout: 3.20,
        status: 'active',
        geo: 'US,CA',
        description: 'Credit revolution with PIN verification',
        redirect_url: 'https://credit-storm.example.com',
        total_revenue: 9800.00,
        network_share: 4900.00,
        affiliate_share: 4900.00
      }
    });
    
    console.log('✅ Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Affiliate,
  Campaign,
  Click,
  initializeDatabase,
  seedDatabase
};
```

## backend/utils/revenue-split.js
```javascript
/**
 * Aplica el revenue split del 50% entre la red y el afiliado
 */
const applyRevenueSplit = (totalRevenue) => {
  const splitPercentage = 0.5;
  
  const networkRevenue = totalRevenue * splitPercentage;
  const affiliateRevenue = totalRevenue * splitPercentage;
  
  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    networkRevenue: parseFloat(networkRevenue.toFixed(2)),
    affiliateRevenue: parseFloat(affiliateRevenue.toFixed(2)),
    splitPercentage
  };
};

const getAffiliateDisplayRevenue = (totalRevenue) => {
  return parseFloat((totalRevenue * 0.5).toFixed(2));
};

const getNetworkRevenue = (totalRevenue) => {
  return parseFloat((totalRevenue * 0.5).toFixed(2));
};

module.exports = {
  applyRevenueSplit,
  getAffiliateDisplayRevenue,
  getNetworkRevenue
};
```

## backend/api/auth.js
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Affiliate } = require('../utils/database');
const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'rebelsrev-secret-2024',
    { expiresIn: '7d' }
  );
};

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email: username }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.role);
    
    // Si es afiliado, obtener datos del afiliado
    let affiliateData = null;
    if (user.role === 'affiliate') {
      affiliateData = await Affiliate.findOne({ where: { user_id: user.id } });
    }
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      affiliate: affiliateData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'affiliate' } = req.body;
    
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      role
    });
    
    const token = generateToken(newUser.id, newUser.role);
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## backend/api/affiliates.js
```javascript
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
```

## backend/api/campaigns.js
```javascript
const express = require('express');
const { Campaign } = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

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
```

## backend/api/tracking.js
```javascript
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
```

## backend/api/stats.js
```javascript
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
```

## backend/middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'rebelsrev-secret-2024', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```