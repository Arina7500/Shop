require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const { 
  productController, 
  categoryController, 
  cartController, 
  authController, 
  adminController 
} = require('./app/config/container');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Хранилище сессий в PostgreSQL
const pgConString = process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/tea_shop';
app.use(session({
  store: new pgSession({
    conString: pgConString,
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: true,   
  name: 'tea-shop.sid',      
  cookie: { secure: false, httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

// Роуты аутентификации
app.post('/api/auth/register', authController.register.bind(authController));
app.post('/api/auth/login', authController.login.bind(authController));
app.post('/api/auth/logout', authController.logout.bind(authController));
app.get('/api/user', authController.getUser.bind(authController));

// Публичные роуты
app.get('/api/categories', categoryController.getAll.bind(categoryController));
app.get('/api/products', productController.getAll.bind(productController));
app.get('/api/products/popular', productController.getPopular.bind(productController));
app.get('/api/cart', cartController.getCart.bind(cartController));
app.post('/api/cart/add', cartController.addItem.bind(cartController));
app.put('/api/cart/update', cartController.updateItem.bind(cartController));
app.delete('/api/cart/remove/:productId', cartController.removeItem.bind(cartController));
app.post('/api/orders', cartController.createOrder.bind(cartController));

// Middleware для проверки прав
function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ error: 'Не авторизован' });
}
function isAdmin(req, res, next) {
  if (req.session.role === 'admin') return next();
  res.status(403).json({ error: 'Доступ запрещён' });
}

// Админские роуты
app.get('/api/admin/stats', isAuthenticated, isAdmin, adminController.getStats.bind(adminController));
app.post('/api/admin/products', isAuthenticated, isAdmin, productController.create.bind(productController));

// Проверка работоспособности
app.get('/', (req, res) => {
  res.json({ message: 'Tea Shop API is running', endpoints: ['/api/categories', '/api/products', '/api/cart'] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API сервер запущен на http://localhost:${PORT}`));