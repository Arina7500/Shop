const db = require('../../models');
const bcrypt = require('bcrypt');

class AuthRepository {
  async findUserByEmail(email) {
    return await db.User.findOne({ where: { email } });
  }

  async findByEmail(email) {
    return await this.findUserByEmail(email);
  }

  async createUser(email, password) {
    return await db.User.create({ email, password });
  }

  async create(data) {
    return await this.createUser(data.email, data.password);
  }

  async findById(id) {
    return await db.User.findByPk(id);
  }

  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = AuthRepository;