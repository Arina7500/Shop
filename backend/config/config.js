require('dotenv').config({ path: '../.env' });

console.log('DB_PASSWORD from env:', process.env.DB_PASSWORD); 

// module.exports = {
//   development: {
//     username: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'postgres',
//     database: process.env.DB_NAME || 'tea_shop',
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//   },

module.exports = {
  development: {
    username: 'postgres',
    password: 'postgres',      
    database: 'tea_shop',
    host: 'postgres',          
    port: 5432,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  },
};