const db = require('../../models');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async register(req, res) {
    try {
      const { email, password } = req.body;
      const user = await this.authService.register(email, password);
      res.json({ success: true, userId: user.id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await this.authService.login(email, password);
      req.session.userId = user.id;
      req.session.role = user.role;
      res.json({ success: true, role: user.role });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  async logout(req, res) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }

  async getUser(req, res) {
    if (!req.session.userId) return res.json({ user: null });
    const user = await db.User.findByPk(req.session.userId, { attributes: ['id', 'email', 'role'] });
    res.json({ user });
  }
}

module.exports = AuthController;