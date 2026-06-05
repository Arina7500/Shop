const db = require('../../models');

class OrderRepository {
  async count() {
    return await db.Order.count();
  }
  async findAll() {
    return await db.Order.findAll();
  }
}

module.exports = OrderRepository;