module.exports = (sequelize, DataTypes) => {
  const Affiliate = sequelize.define('Affiliate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    sub_id: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive', 'pending', 'banned'), defaultValue: 'active' },
    commission_rate: { type: DataTypes.DECIMAL(5,4), defaultValue: 0.5 },
    total_clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_conversions: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_revenue: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    displayed_revenue: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    pending_payment: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    join_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    last_activity: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'affiliates',
    timestamps: true
  });
  return Affiliate;
}
