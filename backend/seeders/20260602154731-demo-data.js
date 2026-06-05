'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Категории
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Чай',
        description: 'В чайной карте представлены чаи, классифицированные по степени ферментации. Белый, чёрный, зелёный, красный, жёлтый чаи или улуны и пуэры.',
        image_url: '/images/чай.jpg',
        sort_order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Чайные смеси',
        description: 'Раздел содержит травяные чаи и чайные смеси.',
        image_url: '/images/чайные_смеси.jpg',
        sort_order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Чайная утварь',
        description: 'Всё, что может понадобиться для чайной церемонии или просто удобного чаепития. Чайники, пиалы, гайвани, чахаи и многое другое.',
        image_url: '/images/чайная_утварь.jpg',
        sort_order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Товары (добавьте хотя бы несколько)
    await queryInterface.bulkInsert('products', [
      {
        name: 'Шу Пуэр',
        description: 'Выдержанный Пуэр с насыщенным вкусом.',
        price: 1300,
        category_id: 1,
        image_url: '/images/шу_пуэр.jpg',
        stock_quantity: 100,
        is_popular: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Те Гуань Инь',
        description: 'Знаменитый улун из провинции Фуцзянь.',
        price: 1050,
        category_id: 1,
        image_url: '/images/те_гуань_инь.jpg',
        stock_quantity: 85,
        is_popular: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лунцзин',
        description: 'Знаменитый чай из Ханчжоу.',
        price: 1000,
        category_id: 1,
        image_url: '/images/лунцзин.jpg',
        stock_quantity: 75,
        is_popular: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // добавьте остальные товары по желанию
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};