<template>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchAPI, escapeHtml } from '../utils/api'

const categories = ref([])
const popular = ref([])

const loadData = async () => {
  try {
    const [cats, pops] = await Promise.all([
      fetchAPI('/categories'),
      fetchAPI('/products/popular')
    ])
    categories.value = cats
    popular.value = pops
  } catch(e) { console.error(e) }
}

const addToCart = async (productId) => {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
      credentials: 'include'
    })
    if (res.ok) {
      window.dispatchEvent(new CustomEvent('cart-updated'))
      alert('Товар добавлен в корзину!')
    } else alert('Ошибка добавления')
  } catch(e) { alert('Ошибка сети') }
}

const handleImageError = (e) => { e.target.src = '/images/placeholder.jpg' }

onMounted(loadData)
</script>