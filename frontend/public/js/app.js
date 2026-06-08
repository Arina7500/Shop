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
        else loadCartPage();
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
    '/cart': 'cart',
    '/admin': 'admin'
};

async function router() {
    const path = window.location.pathname;
    const page = routes[path] || 'home';
    
    if (page === 'home') await loadHomePage();
    else if (page === 'admin') await loadAdminPage();
    else if (page === 'catalog') await loadCatalogPage();
    else if (page === 'cart') await loadCartPage();
    else await loadHomePage();
}

function navigateTo(path) {
    window.history.pushState({}, '', path);
    router();
}

// Открытие модального окна оформления заказа
window.checkout = async function() {
    const modal = document.getElementById('orderModal');
    if (!modal) {
        console.error('Модальное окно не найдено');
        return;
    }
    const form = document.getElementById('orderForm');
    if (form) form.reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    modal.style.display = 'block';
};

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

async function submitOrder() {
    const customer_name = document.getElementById('customer_name').value.trim();
    const customer_phone = document.getElementById('customer_phone').value.trim();
    const customer_email = document.getElementById('customer_email').value.trim();
    const delivery_address = document.getElementById('delivery_address').value.trim();
    const delivery_date = document.getElementById('delivery_date').value;
    const comment = document.getElementById('comment').value;
    const payment_method = document.getElementById('payment_method').value;

    let hasError = false;
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    if (!customer_name) {
        document.getElementById('name-error').textContent = 'Имя обязательно';
        hasError = true;
    }
    if (!customer_phone) {
        document.getElementById('phone-error').textContent = 'Телефон обязателен';
        hasError = true;
    }
    if (!customer_email) {
        document.getElementById('email-error').textContent = 'Email обязателен';
        hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(customer_email)) {
        document.getElementById('email-error').textContent = 'Введите корректный email';
        hasError = true;
    }
    if (!delivery_address) {
        document.getElementById('address-error').textContent = 'Адрес доставки обязателен';
        hasError = true;
    }

    if (hasError) return;

    try {
        const cart = await fetchAPI('/cart');
        if (!cart.items || cart.items.length === 0) {
            alert('Корзина пуста');
            closeOrderModal();
            return;
        }

        const orderData = {
            name: customer_name,
            phone: customer_phone,
            email: customer_email,
            address: delivery_address,
            deliveryDate: delivery_date,
            comment: comment,
            payment: payment_method,
            items: cart.items.map(item => ({
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });

        if (res.ok) {
            const data = await res.json();
            alert(`Заказ оформлен! Номер заказа: ${data.orderId}\nСумма: ${data.totalAmount} ₽`);
            closeOrderModal();
            if (window.location.pathname === '/cart') {
                await loadCartPage();
            } else {
                const newCart = await fetchAPI('/cart');
                updateCartCounter(newCart.count);
            }
        } else {
            const err = await res.json();
            alert(`Ошибка: ${err.error || 'Не удалось оформить заказ'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Ошибка сети при оформлении заказа');
    }
}

async function loadAdminPage() {
    const container = document.getElementById('content');
    if (!container) return;
    container.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const userInfo = await fetchAPI('/user');
        if (!userInfo.user || userInfo.user.role !== 'admin') {
            container.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">Доступ запрещён. Только для администраторов.</p>';
            return;
        }

        const stats = await fetchAPI('/admin/stats');
        container.innerHTML = `
            <div class="admin-stats" style="max-width: 800px; margin: 50px auto; padding: 20px; background: white; border-radius: 20px;">
                <h2 style="text-align: center;">Админ-панель</h2>
                <div style="display: flex; justify-content: space-around; gap: 20px; margin-top: 30px;">
                    <div style="text-align: center; padding: 20px; background: rgba(206,94,178,0.1); border-radius: 15px; flex: 1;">
                        <h3>Товары</h3>
                        <p style="font-size: 36px; color: rgb(206,94,178);">${stats.totalProducts}</p>
                    </div>
                    <div style="text-align: center; padding: 20px; background: rgba(206,94,178,0.1); border-radius: 15px; flex: 1;">
                        <h3>Пользователи</h3>
                        <p style="font-size: 36px; color: rgb(206,94,178);">${stats.totalUsers}</p>
                    </div>
                    <div style="text-align: center; padding: 20px; background: rgba(206,94,178,0.1); border-radius: 15px; flex: 1;">
                        <h3>Заказы</h3>
                        <p style="font-size: 36px; color: rgb(206,94,178);">${stats.totalOrders}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<p>Ошибка: ${err.message}</p>`;
    }
}

// ===== ВСЕ ОБРАБОТЧИКИ ОБЕРНУТЫ В DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', () => {
    // Навигация
    document.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) navigateTo(href);
        });
    });

    // Модальное окно оформления заказа
    const orderModal = document.getElementById('orderModal');
    if (orderModal) {
        const closeBtn = orderModal.querySelector('.close-modal');
        const cancelBtn = document.getElementById('cancelOrderBtn');
        if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeOrderModal);
        window.addEventListener('click', (e) => {
            if (e.target === orderModal) closeOrderModal();
        });
    }

    // Форма заказа
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitOrder();
        });
    }

    // Счетчик символов комментария
    const commentField = document.getElementById('comment');
    const charCountSpan = document.getElementById('charCount');
    if (commentField && charCountSpan) {
        commentField.addEventListener('input', () => {
            const remaining = 500 - commentField.value.length;
            charCountSpan.textContent = remaining;
            charCountSpan.style.color = remaining < 0 ? 'red' : 'rgb(206, 94, 178)';
        });
    }

    // Авторизация: открытие модального окна
    const authLink = document.getElementById('authLink');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');

    if (authLink && authModal) {
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'block';
        });
    }

    if (closeAuthModal && authModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    // Логин
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const authMessage = document.getElementById('authMessage');
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok) {
                    if (authModal) authModal.style.display = 'none';
                    if (authMessage) authMessage.innerText = '';
                    const userDisplay = document.getElementById('userDisplay');
                    if (userDisplay) userDisplay.innerText = email;
                    router();
                } else {
                    if (authMessage) authMessage.innerText = data.error;
                }
            } catch (err) {
                console.error(err);
                if (authMessage) authMessage.innerText = 'Ошибка сети';
            }
        });
    }

    // Регистрация
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });
                if (res.ok) {
                    alert('Регистрация успешна, теперь войдите');
                } else {
                    const err = await res.json();
                    alert(err.error);
                }
            } catch (err) {
                console.error(err);
                alert('Ошибка сети');
            }
        });
    }

    // Запуск роутера после инициализации
    router();
});

window.addEventListener('popstate', () => router());