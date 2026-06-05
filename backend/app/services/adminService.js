class AdminService {
  constructor(productRepository, userRepository, orderRepository) {
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
  }
  async getStats() {
    const totalProducts = await this.productRepository.count();
    const totalUsers = await this.userRepository.count();
    const totalOrders = await this.orderRepository.count();
    return { totalProducts, totalUsers, totalOrders };
  }
}

module.exports = AdminService;