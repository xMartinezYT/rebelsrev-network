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
try {
  require('pg');
  console.log('✅ pg module loaded');
} catch (e) {
  console.error('❌ pg module is missing');
}

module.exports = {
  sequelize,
  User,
  Affiliate,
  Campaign,
  Click,
  initializeDatabase,
  seedDatabase

};
