const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    category_id: DataTypes.INTEGER,
    image_url: DataTypes.STRING,
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_popular: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { timestamps: true, tableName: 'products' });

  return Product;
};