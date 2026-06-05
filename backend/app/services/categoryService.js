class CategoryService {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAll() {
    return await this.categoryRepository.getAll();
  }
}

module.exports = CategoryService;