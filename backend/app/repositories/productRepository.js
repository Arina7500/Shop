const db = require('../../models');

class ProductRepository {
  async getAll() {
    return await db.Product.findAll({ include: [{ model: db.Category, attributes: ['name'] }] });
  }
  async getPopular(limit = 9) {
    return await db.Product.findAll({ where: { is_popular: true }, limit });
  }
  async create(data) {
    return await db.Product.create(data);
  }
  async findById(id) {
    return await db.Product.findByPk(id);
  }
  async count() {
    return await db.Product.count();
  }
}

module.exports = ProductRepository;