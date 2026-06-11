<template>
  <nav>
    <a href="/" @click.prevent="$router.push('/')">Главная</a>
    <a href="/about">О нас</a>
    <a href="/catalog" @click.prevent="$router.push('/catalog')">Каталог</a>
    <a href="/journal">Журнал о чае</a>
    <a href="/cart" @click.prevent="$router.push('/cart')">Корзина (<span>{{ cartCount }}</span>)</a>
    <a href="#" @click.prevent="showAuthModal = true">Вход</a>
    <span v-if="userEmail" class="user-email">{{ userEmail }}</span>
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
      <div v-if="authMessage" class="error-message">{{ authMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAPI } from '../utils/api'

const router = useRouter()
const showAuthModal = ref(false)
const authEmail = ref('')
const authPassword = ref('')
const authMessage = ref('')
const userEmail = ref('')
const cartCount = ref(0)

const fetchUser = async () => {
  try {
    const data = await fetchAPI('/user')
    userEmail.value = data.user?.email || ''
  } catch(e) { userEmail.value = '' }
}

const refreshCartCount = async () => {
  try {
    const cart = await fetchAPI('/cart')
    cartCount.value = cart.count || 0
  } catch(e) { cartCount.value = 0 }
}

const login = async () => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail.value, password: authPassword.value }),
      credentials: 'include'
    })
    const data = await res.json()
    if (res.ok) {
      showAuthModal.value = false
      authMessage.value = ''
      await fetchUser()
      await refreshCartCount()
      router.push('/')
    } else {
      authMessage.value = data.error
    }
  } catch(e) { authMessage.value = 'Ошибка сети' }
}

const register = async () => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail.value, password: authPassword.value }),
      credentials: 'include'
    })
    if (res.ok) {
      alert('Регистрация успешна, теперь войдите')
      authMessage.value = ''
    } else {
      const err = await res.json()
      alert(err.error)
    }
  } catch(e) { alert('Ошибка сети') }
}

const handleCartUpdate = () => {
  refreshCartCount()
}

onMounted(() => {
  fetchUser()
  refreshCartCount()
  window.addEventListener('cart-updated', handleCartUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('cart-updated', handleCartUpdate)
})
</script>

<style scoped>
.user-email {
  color: white;
  margin-left: 10px;
}
.error-message {
  color: red;
  margin-top: 10px;
}
</style>