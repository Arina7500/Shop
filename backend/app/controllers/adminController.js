class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }
  async getStats(req, res) {
    try {
      const stats = await this.adminService.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AdminController;