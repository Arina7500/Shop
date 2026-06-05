const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    session_id: DataTypes.STRING,
    customer_name: DataTypes.STRING,
    customer_phone: DataTypes.STRING,
    customer_email: DataTypes.STRING,
    delivery_address: DataTypes.TEXT,
    delivery_date: DataTypes.DATE,
    comment: DataTypes.TEXT,
    payment_method: DataTypes.STRING,
    total_amount: DataTypes.DECIMAL(10,2),
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
  }, { timestamps: true, tableName: 'orders' });

  return Order;
};