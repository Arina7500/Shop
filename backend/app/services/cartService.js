class CartService {
  constructor(cartRepository) {
    this.cartRepository = cartRepository;
  }

  async getCart(sessionId) {
    const items = await this.cartRepository.getCartItems(sessionId);
    const total = await this.cartRepository.getCartTotal(sessionId);
    const count = await this.cartRepository.getCartCount(sessionId);
    return { items, total, count };
  }

  async addItem(sessionId, productId, quantity) {
    await this.cartRepository.addItem(sessionId, productId, quantity);
  }

  async updateQuantity(sessionId, productId, quantity) {
    await this.cartRepository.updateQuantity(sessionId, productId, quantity);
  }

  async removeItem(sessionId, productId) {
    await this.cartRepository.removeItem(sessionId, productId);
  }

  async createOrder(sessionId, orderData, items) {
    return await this.cartRepository.createOrder(sessionId, orderData, items);
  }
}

module.exports = CartService;