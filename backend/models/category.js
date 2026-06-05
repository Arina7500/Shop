const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT,
    image_url: DataTypes.STRING,
    sort_order: DataTypes.INTEGER,
  }, { timestamps: true, tableName: 'categories' });

  return Category;
};