module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define('Campaign', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    type: { type: DataTypes.ENUM('sweeps', 'mobile_content', 'pin_submit', 'dating', 'finance'), allowNull: false },
    payout: { type: DataTypes.DECIMAL(8,2), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive', 'paused'), defaultValue: 'active' },
    geo: { type: DataTypes.STRING(500) },
    description: { type: DataTypes.TEXT },
    redirect_url: { type: DataTypes.STRING(500) },
    total_revenue: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    network_share: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    affiliate_share: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 }
  }, {
    tableName: 'campaigns',
    timestamps: true
  });
  return Campaign;
}
