const bcrypt = require('bcrypt');

class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async register(email, password) {
    const existing = await this.authRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email already used');
    }
    // Модель сама захеширует пароль через beforeCreate
    const user = await this.authRepository.create({ email, password });
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email, password) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  async getUser(id) {
    const user = await this.authRepository.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role };
  }
}

module.exports = AuthService;