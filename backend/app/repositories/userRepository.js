const db = require('../../models');

class UserRepository {
  async count() {
    return await db.User.count();
  }
  async findById(id) {
    return await db.User.findByPk(id);
  }
}

module.exports = UserRepository;