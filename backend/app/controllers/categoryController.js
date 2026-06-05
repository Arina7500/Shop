class CategoryController {
  constructor(categoryService) {
    this.categoryService = categoryService;
  }

  async getAll(req, res) {
    try {
      const categories = await this.categoryService.getAll();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = CategoryController;