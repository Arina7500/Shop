class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getAll() {
    return await this.productRepository.getAll();
  }

  async getPopular(limit) {
    return await this.productRepository.getPopular(limit);
  }

  async create(data) {
    return await this.productRepository.create(data);
  }
}

module.exports = ProductService;