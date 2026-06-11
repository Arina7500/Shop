<template>
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
        <div class="button-wrapper">
          <button class="checkout-btn" @click="showOrderModal = true">Оформить заказ</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-cart">
      <p>Корзина пуста</p>
      <a href="/catalog" @click.prevent="$router.push('/catalog')">Перейти в каталог</a>
    </div>

    <!-- Модальное окно оформления заказа -->
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAPI, escapeHtml } from '../utils/api'

const router = useRouter()
const cart = ref({ items: [], total: 0 })
const loading = ref(false)
const error = ref('')
const showOrderModal = ref(false)
const orderForm = ref({
  name: '', phone: '', email: '', address: '', deliveryDate: '', comment: '', payment: 'card'
})

const loadCart = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchAPI('/cart')
    cart.value = data
    window.dispatchEvent(new CustomEvent('cart-updated'))
  } catch(e) {
    error.value = 'Не удалось загрузить корзину'
    cart.value = { items: [], total: 0 }
  } finally {
    loading.value = false
  }
}

const updateQuantity = async (productId, quantity) => {
  if (quantity < 0) return
  try {
    await fetch('/api/cart/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
      credentials: 'include'
    })
    await loadCart()
  } catch(e) { error.value = 'Ошибка обновления' }
}

const removeFromCart = async (productId) => {
  try {
    await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE', credentials: 'include' })
    await loadCart()
  } catch(e) { error.value = 'Ошибка удаления' }
}

const submitOrder = async () => {
  if (!cart.value.items.length) {
    alert('Корзина пуста')
    showOrderModal.value = false
    return
  }
  const orderData = {
    name: orderForm.value.name,
    phone: orderForm.value.phone,
    email: orderForm.value.email,
    address: orderForm.value.address,
    deliveryDate: orderForm.value.deliveryDate,
    comment: orderForm.value.comment,
    payment: orderForm.value.payment,
    items: cart.value.items.map(item => ({
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  }
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
      credentials: 'include'
    })
    if (res.ok) {
      const data = await res.json()
      alert(`Заказ оформлен! Номер: ${data.orderId}, сумма: ${data.totalAmount} ₽`)
      showOrderModal.value = false
      await loadCart()
    } else {
      const err = await res.json()
      alert(`Ошибка: ${err.error}`)
    }
  } catch(e) { alert('Ошибка сети') }
}

onMounted(loadCart)
</script>