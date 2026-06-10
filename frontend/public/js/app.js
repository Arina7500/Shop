const { createApp } = Vue;
const { createRouter, createWebHistory } = VueRouter;

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
const API_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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

// ========== КОМПОНЕНТ НАВИГАЦИИ ==========
const AppNav = {
    data() {
        return {
            showAuthModal: false,
            authEmail: '',
            authPassword: '',
            authMessage: '',
            userEmail: '',
            cartCount: 0
        };
    },
    mounted() {
        this.fetchUser();
        this.refreshCartCount();
        window.addEventListener('cart-updated', this.refreshCartCount);
    },
    beforeUnmount() {
        window.removeEventListener('cart-updated', this.refreshCartCount);
    },
    methods: {
        async fetchUser() {
            try {
                const data = await fetchAPI('/user');
                this.userEmail = data.user?.email || '';
            } catch(e) { this.userEmail = ''; }
        },
        async refreshCartCount() {
            console.log('refreshing');
            try {
                const cart = await fetchAPI('/cart');
                this.cartCount = cart.count || 0;
            } catch(e) { this.cartCount = 0; }
        },
        async login() {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.authEmail, password: this.authPassword }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok) {
                    this.showAuthModal = false;
                    this.authMessage = '';
                    this.fetchUser();
                    window.dispatchEvent(new CustomEvent('cart-updated'));
                    this.$router.push('/');
                } else {
                    this.authMessage = data.error;
                }
            } catch(e) { this.authMessage = 'Ошибка сети'; }
        },
        async register() {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.authEmail, password: this.authPassword }),
                    credentials: 'include'
                });
                if (res.ok) {
                    alert('Регистрация успешна, теперь войдите');
                    this.authMessage = '';
                } else {
                    const err = await res.json();
                    alert(err.error);
                }
            } catch(e) { alert('Ошибка сети'); }
        }
    },
    template: `
        <nav>
            <a href="/" @click.prevent="$router.push('/')">Главная</a>
            <a href="/about">О нас</a>
            <a href="/catalog" @click.prevent="$router.push('/catalog')">Каталог</a>
            <a href="/journal">Журнал о чае</a>
            <a href="/cart" @click.prevent="$router.push('/cart')">Корзина (<span>{{ cartCount }}</span>)</a>
            <a href="#" @click.prevent="showAuthModal = true">Вход</a>
            <span v-if="userEmail" style="color: white; margin-left: 10px;">{{ userEmail }}</span>
            <a href="/admin" @click.prevent="$router.push('/admin')">Админ</a>
        </nav>

        <div v-if="showAuthModal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close-modal" @click="showAuthModal = false">&times;</span>
                <h2>Вход / Регистрация</h2>
                <form @submit.prevent>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" v-model="authEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Пароль</label>
                        <input type="password" v-model="authPassword" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="submit-btn" @click="login">Войти</button>
                        <button type="button" class="cancel-btn" @click="register">Зарегистрироваться</button>
                    </div>
                </form>
                <div v-if="authMessage" style="color: red; margin-top: 10px;">{{ authMessage }}</div>
            </div>
        </div>
    `
};

// ========== ГЛАВНАЯ СТРАНИЦА ==========
const HomePage = {
    data() {
        return { categories: [], popular: [] };
    },
    async mounted() {
        try {
            const [cats, pops] = await Promise.all([
                fetchAPI('/categories'),
                fetchAPI('/products/popular')
            ]);
            this.categories = cats;
            this.popular = pops;
        } catch(e) { console.error(e); }
    },
    methods: {
        async addToCart(productId) {
            try {
                const res = await fetch(`${API_URL}/cart/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity: 1 }),
                    credentials: 'include'
                });
                if (res.ok) {
                    window.dispatchEvent(new CustomEvent('cart-updated'));
                    alert('Товар добавлен в корзину!');
                } else alert('Ошибка добавления');
            } catch(e) { alert('Ошибка сети'); }
        },
        handleImageError(e) { e.target.src = '/images/placeholder.jpg'; },
        escapeHtml(str) { return escapeHtml(str); }
    },
    template: `
        <div>
            <div class="cards-container">
                <h2>Чайная карта</h2>
                <div class="cards-container">
                    <div v-for="c in categories" :key="c.id" class="card">
                        <img :src="c.image_url || '/images/placeholder.jpg'" class="card-image" @error="handleImageError">
                        <div class="card-content">
                            <h3>{{ escapeHtml(c.name) }}</h3>
                            <p>{{ escapeHtml(c.description) }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <section class="popular-products">
                <h2>Популярные товары</h2>
                <div class="product-grid">
                    <div v-for="p in popular" :key="p.id" class="product-card">
                        <img :src="p.image_url || '/images/placeholder.jpg'" class="product-image" @error="handleImageError">
                        <h3>{{ escapeHtml(p.name) }}</h3>
                        <p>{{ escapeHtml(p.description || '') }}</p>
                        <p class="product-price">{{ p.price }} ₽</p>
                        <button class="product-btn" @click="addToCart(p.id)">Купить</button>
                    </div>
                </div>
            </section>
        </div>
    `
};

// ========== КАТАЛОГ ==========
const CatalogPage = {
    data() {
        return { teas: [], mixes: [], utensils: [] };
    },
    async mounted() {
        try {
            const products = await fetchAPI('/products');
            this.teas = products.filter(p => p.Category?.name === 'Чай');
            this.mixes = products.filter(p => p.Category?.name === 'Чайные смеси');
            this.utensils = products.filter(p => p.Category?.name === 'Чайная утварь');
        } catch(e) { console.error(e); }
    },
    methods: {
        async addToCart(productId) {
            try {
                const res = await fetch(`${API_URL}/cart/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity: 1 }),
                    credentials: 'include'
                });
                if (res.ok) {
                    window.dispatchEvent(new CustomEvent('cart-updated'));
                    alert('Товар добавлен в корзину!');
                } else alert('Ошибка добавления');
            } catch(e) { alert('Ошибка сети'); }
        },
        escapeHtml(str) { return escapeHtml(str); }
    },
    template: `
        <div>
            <section v-if="teas.length" class="content-section">
                <h2>Чай</h2>
                <div class="product-grid">
                    <div v-for="p in teas" :key="p.id" class="product-card">
                        <img :src="p.image_url || '/images/placeholder.jpg'" class="product-image" @error="$event.target.src='/images/placeholder.jpg'">
                        <h3>{{ escapeHtml(p.name) }}</h3>
                        <p>{{ escapeHtml(p.description || '') }}</p>
                        <p class="product-price">{{ p.price }} ₽</p>
                        <button class="product-btn" @click="addToCart(p.id)">Купить</button>
                    </div>
                </div>
            </section>
            <section v-if="mixes.length" class="content-section">
                <h2>Чайные смеси</h2>
                <div class="product-grid">
                    <div v-for="p in mixes" :key="p.id" class="product-card">
                        <img :src="p.image_url || '/images/placeholder.jpg'" class="product-image" @error="$event.target.src='/images/placeholder.jpg'">
                        <h3>{{ escapeHtml(p.name) }}</h3>
                        <p>{{ escapeHtml(p.description || '') }}</p>
                        <p class="product-price">{{ p.price }} ₽</p>
                        <button class="product-btn" @click="addToCart(p.id)">Купить</button>
                    </div>
                </div>
            </section>
            <section v-if="utensils.length" class="content-section">
                <h2>Чайная утварь</h2>
                <div class="product-grid">
                    <div v-for="p in utensils" :key="p.id" class="product-card">
                        <img :src="p.image_url || '/images/placeholder.jpg'" class="product-image" @error="$event.target.src='/images/placeholder.jpg'">
                        <h3>{{ escapeHtml(p.name) }}</h3>
                        <p>{{ escapeHtml(p.description || '') }}</p>
                        <p class="product-price">{{ p.price }} ₽</p>
                        <button class="product-btn" @click="addToCart(p.id)">Купить</button>
                    </div>
                </div>
            </section>
            <div v-if="!teas.length && !mixes.length && !utensils.length" class="empty-cart">Товары не найдены</div>
        </div>
    `
};

// ========== КОРЗИНА ==========
const CartPage = {
    data() {
        return {
            cart: { items: [], total: 0 },
            loading: false,
            error: '',
            showOrderModal: false,
            orderForm: { name: '', phone: '', email: '', address: '', deliveryDate: '', comment: '', payment: 'card' }
        };
    },
    mounted() { this.loadCart(); },
    methods: {
        async loadCart() {
            this.loading = true;
            this.error = '';
            try {
                const data = await fetchAPI('/cart');
                this.cart = data;
                window.dispatchEvent(new CustomEvent('cart-updated'));
            } catch(e) {
                this.error = 'Не удалось загрузить корзину';
                this.cart = { items: [], total: 0 };
            } finally {
                this.loading = false;
            }
        },
        async updateQuantity(productId, quantity) {
            if (quantity < 0) return;
            try {
                await fetch(`${API_URL}/cart/update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity }),
                    credentials: 'include'
                });
                await this.loadCart();
            } catch(e) { this.error = 'Ошибка обновления'; }
        },
        async removeFromCart(productId) {
            try {
                await fetch(`${API_URL}/cart/remove/${productId}`, { method: 'DELETE', credentials: 'include' });
                await this.loadCart();
            } catch(e) { this.error = 'Ошибка удаления'; }
        },
        async submitOrder() {
            if (!this.cart.items.length) {
                alert('Корзина пуста');
                this.showOrderModal = false;
                return;
            }
            const orderData = {
                name: this.orderForm.name,
                phone: this.orderForm.phone,
                email: this.orderForm.email,
                address: this.orderForm.address,
                deliveryDate: this.orderForm.deliveryDate,
                comment: this.orderForm.comment,
                payment: this.orderForm.payment,
                items: this.cart.items.map(item => ({
                    product_id: item.product_id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            try {
                const res = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData),
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    alert(`Заказ оформлен! Номер: ${data.orderId}, сумма: ${data.totalAmount} ₽`);
                    this.showOrderModal = false;
                    await this.loadCart();
                } else {
                    const err = await res.json();
                    alert(`Ошибка: ${err.error}`);
                }
            } catch(e) { alert('Ошибка сети'); }
        },
        escapeHtml(str) { return escapeHtml(str); }
    },
    template: `
        <div>
            <div v-if="loading">Загрузка...</div>
            <div v-else-if="error" class="empty-cart" style="color: red;">{{ error }}</div>
            <div v-else-if="cart.items && cart.items.length">
                <div class="cart-items-container">
                    <div v-for="item in cart.items" :key="item.product_id" class="cart-item">
                        <div class="cart-item-info">
                            <h3>{{ escapeHtml(item.name) }}</h3>
                            <div class="cart-item-details">
                                <span class="cart-item-price">{{ item.price }} ₽</span>
                                <span class="cart-item-subtotal">Сумма: <span>{{ item.price * item.quantity }} ₽</span></span>
                            </div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" @click="updateQuantity(item.product_id, item.quantity - 1)">-</button>
                            <span>{{ item.quantity }}</span>
                            <button class="quantity-btn" @click="updateQuantity(item.product_id, item.quantity + 1)">+</button>
                        </div>
                        <div class="cart-item-remove">
                            <button class="remove-btn" @click="removeFromCart(item.product_id)">✕</button>
                        </div>
                    </div>
                </div>
                <div class="cart-total-section">
                    <div class="cart-total">Итого: <span>{{ cart.total }} ₽</span></div>
                    <div class="button-wrapper"><button class="checkout-btn" @click="showOrderModal = true">Оформить заказ</button></div>
                </div>
            </div>
            <div v-else class="empty-cart">
                <p>Корзина пуста</p>
                <a href="/catalog" @click.prevent="$router.push('/catalog')">Перейти в каталог</a>
            </div>

            <div v-if="showOrderModal" class="modal" style="display: block;">
                <div class="modal-content">
                    <span class="close-modal" @click="showOrderModal = false">&times;</span>
                    <h2>Оформление заказа</h2>
                    <form @submit.prevent="submitOrder">
                        <div class="form-group"><label>Имя *</label><input type="text" v-model="orderForm.name" required></div>
                        <div class="form-group"><label>Телефон *</label><input type="tel" v-model="orderForm.phone" required></div>
                        <div class="form-group"><label>Email *</label><input type="email" v-model="orderForm.email" required></div>
                        <div class="form-group"><label>Адрес доставки *</label><textarea v-model="orderForm.address" rows="2" required></textarea></div>
                        <div class="form-group"><label>Дата доставки</label><input type="date" v-model="orderForm.deliveryDate"></div>
                        <div class="form-group"><label>Комментарий</label><textarea v-model="orderForm.comment" rows="2" maxlength="500"></textarea><div class="char-counter">Осталось символов: {{ 500 - orderForm.comment.length }}</div></div>
                        <div class="form-group"><label>Способ оплаты *</label><select v-model="orderForm.payment"><option value="card">Банковская карта</option><option value="cash">Наличными при получении</option></select></div>
                        <div class="form-actions"><button type="button" class="cancel-btn" @click="showOrderModal = false">Отмена</button><button type="submit" class="submit-btn">Подтвердить заказ</button></div>
                    </form>
                </div>
            </div>
        </div>
    `
};

// ========== АДМИНСКАЯ ПАНЕЛЬ ==========
const AdminPage = {
    data() {
        return { stats: null, error: '' };
    },
    async mounted() {
        try {
            const userInfo = await fetchAPI('/user');
            if (!userInfo.user || userInfo.user.role !== 'admin') {
                this.error = 'Доступ запрещён. Только для администраторов.';
                return;
            }
            this.stats = await fetchAPI('/admin/stats');
        } catch(e) { this.error = 'Ошибка загрузки статистики'; }
    },
    template: `
        <div v-if="stats" class="admin-stats" style="max-width:800px; margin:50px auto; padding:20px; background:white; border-radius:20px;">
            <h2 style="text-align:center;">Админ-панель</h2>
            <div style="display:flex; justify-content:space-around; gap:20px; margin-top:30px;">
                <div style="text-align:center; padding:20px; background:rgba(206,94,178,0.1); border-radius:15px; flex:1;">
                    <h3>Товары</h3><p style="font-size:36px; color:rgb(206,94,178);">{{ stats.totalProducts }}</p>
                </div>
                <div style="text-align:center; padding:20px; background:rgba(206,94,178,0.1); border-radius:15px; flex:1;">
                    <h3>Пользователи</h3><p style="font-size:36px; color:rgb(206,94,178);">{{ stats.totalUsers }}</p>
                </div>
                <div style="text-align:center; padding:20px; background:rgba(206,94,178,0.1); border-radius:15px; flex:1;">
                    <h3>Заказы</h3><p style="font-size:36px; color:rgb(206,94,178);">{{ stats.totalOrders }}</p>
                </div>
            </div>
        </div>
        <div v-else-if="error" style="color:red; text-align:center; margin-top:50px;">{{ error }}</div>
        <div v-else class="loading">Загрузка...</div>
    `
};

// ========== ГЛАВНЫЙ КОМПОНЕНТ ==========
const App = {
    components: { AppNav },
    template: `
        <div>
            <AppNav />
            <h1>Хэ Цзин И</h1>
            <h5>Гармония Уважение Истина</h5>
            <router-view />
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-top">
                        <div class="footer-col footer-about"><h3 class="footer-logo">Хэ Цзин И</h3><p class="footer-tagline">Гармония · Уважение · Истина</p></div>
                        <div class="footer-col footer-menu"><h4 class="footer-title">Навигация</h4><ul class="footer-links"><li><a href="/" @click.prevent="$router.push('/')">Главная</a></li><li><a href="/catalog" @click.prevent="$router.push('/catalog')">Каталог</a></li><li><a href="/about">О нас</a></li></ul></div>
                        <div class="footer-col footer-contact"><h4 class="footer-title">Контакты</h4><ul class="footer-contact-list"><li>г. Москва, ул. Чайная, д. 42</li><li>+7 (999) 123-45-67</li><li>info@hejingyi.ru</li></ul></div>
                    </div>
                    <div class="footer-bottom"><p>© 2025 Хэ Цзин И. Все права защищены.</p></div>
                </div>
            </footer>
        </div>
    `
};

// ========== РОУТЕР ==========
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: HomePage },
        { path: '/catalog', component: CatalogPage },
        { path: '/cart', component: CartPage },
        { path: '/admin', component: AdminPage }
    ]
});

// ========== ИНИЦИАЛИЗАЦИЯ ==========
const app = createApp(App);
app.use(router);
app.mount('#app');