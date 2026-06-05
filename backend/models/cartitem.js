const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cart_session_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  }, { timestamps: false, tableName: 'cart_items' });

  return CartItem;
};