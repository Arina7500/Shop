class CartController {
  constructor(cartService) {
    this.cartService = cartService;
  }

  async getCart(req, res) {
    try {
      const cart = await this.cartService.getCart(req.session.id);
      res.json(cart);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async addItem(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      await this.cartService.addItem(req.session.id, productId, quantity);
      const count = await this.cartService.cartRepository.getCartCount(req.session.id);
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateItem(req, res) {
    try {
      const { productId, quantity } = req.body;
      await this.cartService.updateQuantity(req.session.id, productId, quantity);
      const count = await this.cartService.cartRepository.getCartCount(req.session.id);
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async removeItem(req, res) {
    try {
      const productId = parseInt(req.params.productId);
      await this.cartService.removeItem(req.session.id, productId);
      const count = await this.cartService.cartRepository.getCartCount(req.session.id);
      res.json({ success: true, count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createOrder(req, res) {
    try {
      const orderData = req.body;
      const items = orderData.items;
      const order = await this.cartService.createOrder(req.session.id, orderData, items);
      res.json({ success: true, orderId: order.id, totalAmount: order.total_amount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = CartController;