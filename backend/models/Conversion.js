module.exports = (sequelize, DataTypes) => {
  const Conversion = sequelize.define('Conversion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    click_id: { type: DataTypes.INTEGER, allowNull: false },
    affiliate_id: { type: DataTypes.INTEGER, allowNull: false },
    campaign_id: { type: DataTypes.INTEGER, allowNull: false },
    conversion_type: { type: DataTypes.ENUM('sale', 'lead', 'install', 'signup'), defaultValue: 'lead' },
    total_revenue: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    network_revenue: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    affiliate_revenue: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    transaction_id: { type: DataTypes.STRING(100) },
    converted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'conversions',
    timestamps: false
  });
  return Conversion;
}
