const db = require('../../models');

class CartRepository {
  async getOrCreateSession(sessionId) {
    let session = await db.CartSession.findOne({ where: { session_id: sessionId } });
    if (!session) {
      session = await db.CartSession.create({ session_id: sessionId });
    }
    return session;
  }

  async getCartItems(sessionId) {
    const session = await this.getOrCreateSession(sessionId);
    const items = await db.CartItem.findAll({
      where: { cart_session_id: session.id },
      include: [{ model: db.Product, attributes: ['name', 'price', 'image_url'] }]
    });
    return items.map(i => ({
      product_id: i.product_id,
      quantity: i.quantity,
      name: i.Product.name,
      price: i.Product.price,
      image_url: i.Product.image_url
    }));
  }

  async getCartCount(sessionId) {
    const session = await this.getOrCreateSession(sessionId);
    const total = await db.CartItem.sum('quantity', { where: { cart_session_id: session.id } });
    return total || 0;
  }

  async getCartTotal(sessionId) {
    const items = await this.getCartItems(sessionId);
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async addItem(sessionId, productId, quantity) {
    const session = await this.getOrCreateSession(sessionId);
    const existing = await db.CartItem.findOne({ where: { cart_session_id: session.id, product_id: productId } });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await db.CartItem.create({ cart_session_id: session.id, product_id: productId, quantity });
    }
    return true;
  }

  async updateQuantity(sessionId, productId, quantity) {
    const session = await this.getOrCreateSession(sessionId);
    const item = await db.CartItem.findOne({ where: { cart_session_id: session.id, product_id: productId } });
    if (item) {
      if (quantity <= 0) await item.destroy();
      else {
        item.quantity = quantity;
        await item.save();
      }
    }
    return true;
  }

  async removeItem(sessionId, productId) {
    const session = await this.getOrCreateSession(sessionId);
    await db.CartItem.destroy({ where: { cart_session_id: session.id, product_id: productId } });
    return true;
  }

  async clearCart(sessionId) {
    const session = await this.getOrCreateSession(sessionId);
    await db.CartItem.destroy({ where: { cart_session_id: session.id } });
  }

  async createOrder(sessionId, orderData, items) {
    const transaction = await db.sequelize.transaction();
    try {
      const order = await db.Order.create({ ...orderData, session_id: sessionId }, { transaction });
      for (const item of items) {
        await db.OrderItem.create({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          price_at_time: item.price
        }, { transaction });
      }
      await this.clearCart(sessionId);
      await transaction.commit();
      return order;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

module.exports = CartRepository;