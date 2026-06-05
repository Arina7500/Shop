class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  async getAll(req, res) {
    try {
      const products = await this.productService.getAll();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPopular(req, res) {
    try {
      const products = await this.productService.getPopular(9);
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const product = await this.productService.create(req.body);
      res.json({ success: true, product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = ProductController;