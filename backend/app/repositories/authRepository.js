const db = require('../../models');
const bcrypt = require('bcrypt');

class AuthRepository {
  async findUserByEmail(email) {
    return await db.User.findOne({ where: { email } });
  }
  async createUser(email, password) {
    return await db.User.create({ email, password });
  }
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = AuthRepository;