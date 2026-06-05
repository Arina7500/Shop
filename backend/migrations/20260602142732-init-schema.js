'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Таблица Users
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('user', 'admin'), defaultValue: 'user' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Таблица categories
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: Sequelize.TEXT,
      image_url: Sequelize.STRING,
      sort_order: Sequelize.INTEGER,
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Таблица products
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.TEXT,
      price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      category_id: { type: Sequelize.INTEGER, references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      image_url: Sequelize.STRING,
      stock_quantity: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_popular: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Таблица cart_sessions
    await queryInterface.createTable('cart_sessions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      session_id: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Таблица cart_items
    await queryInterface.createTable('cart_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      cart_session_id: { type: Sequelize.INTEGER, references: { model: 'cart_sessions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 }
    });

    // Таблица orders
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      session_id: Sequelize.STRING,
      customer_name: Sequelize.STRING,
      customer_phone: Sequelize.STRING,
      customer_email: Sequelize.STRING,
      delivery_address: Sequelize.TEXT,
      delivery_date: Sequelize.DATE,
      comment: Sequelize.TEXT,
      payment_method: Sequelize.STRING,
      total_amount: Sequelize.DECIMAL(10,2),
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Таблица order_items
    await queryInterface.createTable('order_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: { type: Sequelize.INTEGER, references: { model: 'orders', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      product_id: Sequelize.INTEGER,
      product_name: Sequelize.STRING,
      quantity: Sequelize.INTEGER,
      price_at_time: Sequelize.DECIMAL(10,2)
    });

    // Таблица для сессий (connect-pg-simple)
    await queryInterface.createTable('session', {
      sid: { type: Sequelize.STRING, primaryKey: true },
      sess: { type: Sequelize.JSON, allowNull: false },
      expire: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('cart_items');
    await queryInterface.dropTable('cart_sessions');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('session');
  }
};