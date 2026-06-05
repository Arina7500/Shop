const API_URL = '/api';

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ 
async function fetchAPI(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function updateCartCounter(count) {
    const el = document.getElementById('cart-counter');
    if (el) el.textContent = count || 0;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ЗАГРУЗКА СТРАНИЦ 
async function loadHomePage() {
    const container = document.getElementById('content');
    if (!container) return;
    container.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const [categories, popular] = await Promise.all([
            fetchAPI('/categories'),
            fetchAPI('/products/popular')
        ]);
        let html = `
            <div class="cards-container">
                <h2>Чайная карта</h2>
                <div class="cards-container">
                    ${categories.map(c => `
                        <div class="card">
                            <img src="${c.image_url || '/images/placeholder.jpg'}" class="card-image" onerror="this.src='/images/placeholder.jpg'">
                            <div class="card-content">
                                <h3>${escapeHtml(c.name)}</h3>
                                <p>${escapeHtml(c.description)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <section class="popular-products">
                <h2>Популярные товары</h2>
                <div class="product-grid">
                    ${popular.map(p => `
                        <div class="product-card">
                            <img src="${p.image_url || '/images/placeholder.jpg'}" class="product-image" onerror="this.src='/images/placeholder.jpg'">
                            <h3>${escapeHtml(p.name)}</h3>
                            <p>${escapeHtml(p.description || '')}</p>
                            <p class="product-price">${p.price} ₽</p>
                            <button class="product-btn" onclick="addToCart(${p.id})">Купить</button>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = `<p>Ошибка: ${err.message}</p>`;
    }
}

async function loadCatalogPage() {
    const container = document.getElementById('content');
    if (!container) return;
    container.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const products = await fetchAPI('/products');
        const teas = products.filter(p => p.Category?.name === 'Чай');
        const mixes = products.filter(p => p.Category?.name === 'Чайные смеси');
        const utensils = products.filter(p => p.Category?.name === 'Чайная утварь');

        const renderSection = (title, items) => {
            if (!items.length) return '';
            return `
                <section class="content-section">
                    <h2>${title}</h2>
                    <div class="product-grid">
                        ${items.map(p => `
                            <div class="product-card">
                                <img src="${p.image_url || '/images/placeholder.jpg'}" class="product-image" onerror="this.src='/images/placeholder.jpg'">
                                <h3>${escapeHtml(p.name)}</h3>
                                <p>${escapeHtml(p.description || '')}</p>
                                <p class="product-price">${p.price} ₽</p>
                                <button class="product-btn" onclick="addToCart(${p.id})">Купить</button>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        };

        container.innerHTML = renderSection('Чай', teas) + renderSection('Чайные смеси', mixes) + renderSection('Чайная утварь', utensils);
        if (!container.innerHTML) container.innerHTML = '<p>Товары не найдены</p>';
    } catch (err) {
        container.innerHTML = `<p>Ошибка: ${err.message}</p>`;
    }
}

async function loadCartPage() {
    const container = document.getElementById('content');
    if (!container) return;
    container.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const cart = await fetchAPI('/cart');
        if (!cart.items || cart.items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <p>Корзина пуста</p>
                    <a href="/catalog">Перейти в каталог</a>
                </div>
            `;
            updateCartCounter(0);
            return;
        }
        let html = '<div class="cart-items-container">';
        cart.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h3 class="cart-item-name">${escapeHtml(item.name)}</h3>
                        <div class="cart-item-details">
                            <span class="cart-item-price">${item.price} ₽</span>
                            <span class="cart-item-subtotal">Сумма: <span>${itemTotal} ₽</span></span>
                        </div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.product_id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
                    </div>
                    <div class="cart-item-remove">
                        <button class="remove-btn" onclick="removeFromCart(${item.product_id})">✕</button>
                    </div>
                </div>
            `;
        });
        html += `</div><div class="cart-total-section"><div class="cart-total">Итого: <span>${cart.total} ₽</span></div><div class="button-wrapper"><button class="checkout-btn" onclick="checkout()">Оформить заказ</button></div></div>`;
        container.innerHTML = html;
        updateCartCounter(cart.count);
    } catch (err) {
        container.innerHTML = `<p>Ошибка: ${err.message}</p>`;
    }
}

// ФУНКЦИИ КОРЗИНЫ 
window.addToCart = async function(productId) {
    try {
        const res = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 }),
            credentials: 'include'
        });
        if (res.ok) {
            const data = await res.json();
            updateCartCounter(data.count);
            alert('Товар добавлен в корзину!');
        } else {
            alert('Ошибка добавления');
        }
    } catch (err) {
        console.error(err);
        alert('Ошибка сети');
    }
};

window.updateQuantity = async function(productId, quantity) {
    if (quantity < 0) return;
    try {
        await fetch(`${API_URL}/cart/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
            credentials: 'include'
        });
        if (window.location.pathname === '/cart') location.reload();
        else loadCartPage(); // обновляем счетчик на других страницах
    } catch (err) {
        console.error(err);
    }
};

window.removeFromCart = async function(productId) {
    try {
        await fetch(`${API_URL}/cart/remove/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (window.location.pathname === '/cart') location.reload();
        else loadCartPage();
    } catch (err) {
        console.error(err);
    }
};

// РОУТЕР 
const routes = {
    '/': 'home',
    '/catalog': 'catalog',
    '/cart': 'cart'
};

async function router() {
    const path = window.location.pathname;
    const page = routes[path] || 'home';
    
    if (page === 'home') await loadHomePage();
    else if (page === 'catalog') await loadCatalogPage();
    else if (page === 'cart') await loadCartPage();
    else await loadHomePage();
}

function navigateTo(path) {
    window.history.pushState({}, '', path);
    router();
}

// Обработка кликов по ссылкам с data-link
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) navigateTo(href);
        });
    });
    router();
});

window.addEventListener('popstate', router);

window.checkout = async function() {
    alert('Функция оформления заказа будет реализована');
};