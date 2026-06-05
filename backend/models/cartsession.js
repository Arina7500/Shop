const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CartSession = sequelize.define('CartSession', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    session_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  }, { timestamps: true, tableName: 'cart_sessions' });

  return CartSession;
};