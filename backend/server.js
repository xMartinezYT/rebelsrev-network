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

// Middleware de autenticación (token JWT, etc) - se usa global o en rutas específicas
const authenticateToken = require('./middleware/auth');
app.use(authenticateToken); // aplica middleware globalmente (ajusta si no quieres eso)

// Rutas API
app.use('/api/auth', require('./api/auth'));             // Rutas de login, registro etc
app.use('/api/affiliates', authenticateToken, require('./api/affiliates'));
app.use('/api/campaigns', authenticateToken, require('./api/campaigns'));
app.use('/api/tracking', require('./api/tracking'));     // Tracking puede ser público, sin JWT
app.use('/api/stats', authenticateToken, require('./api/stats'));

// Migration and seed endpoints (para setup inicial)
const { initializeDatabase, seedDatabase } = require('./utils/database');

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
