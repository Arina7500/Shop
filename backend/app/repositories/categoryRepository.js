const db = require('../../models');

class CategoryRepository {
  async getAll() {
    return await db.Category.findAll({ order: [['sort_order', 'ASC']] });
  }
}

module.exports = CategoryRepository;