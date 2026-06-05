const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    product_name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price_at_time: DataTypes.DECIMAL(10,2),
  }, { timestamps: false, tableName: 'order_items' });

  return OrderItem;
};