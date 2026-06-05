const db = require('../../models');

const ProductRepository = require('../repositories/productRepository');
const CategoryRepository = require('../repositories/categoryRepository');
const CartRepository = require('../repositories/cartRepository');
const AuthRepository = require('../repositories/authRepository');
const UserRepository = require('../repositories/userRepository');
const OrderRepository = require('../repositories/orderRepository');

const ProductService = require('../services/productService');
const CategoryService = require('../services/categoryService');
const CartService = require('../services/cartService');
const AuthService = require('../services/authService');
const AdminService = require('../services/adminService');

const ProductController = require('../controllers/productController');
const CategoryController = require('../controllers/categoryController');
const CartController = require('../controllers/cartController');
const AuthController = require('../controllers/authController');
const AdminController = require('../controllers/adminController');

// Инициализация репозиториев
const productRepository = new ProductRepository();
const categoryRepository = new CategoryRepository();
const cartRepository = new CartRepository();
const authRepository = new AuthRepository();
const userRepository = new UserRepository();
const orderRepository = new OrderRepository();

// Инициализация сервисов
const productService = new ProductService(productRepository);
const categoryService = new CategoryService(categoryRepository);
const cartService = new CartService(cartRepository);
const authService = new AuthService(authRepository);
const adminService = new AdminService(productRepository, userRepository, orderRepository);

// Инициализация контроллеров
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);
const cartController = new CartController(cartService);
const authController = new AuthController(authService);
const adminController = new AdminController(adminService);

module.exports = {
  productController,
  categoryController,
  cartController,
  authController,
  adminController,
};