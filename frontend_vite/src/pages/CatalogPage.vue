<template>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchAPI, escapeHtml } from '../utils/api'

const teas = ref([])
const mixes = ref([])
const utensils = ref([])

const loadProducts = async () => {
  try {
    const products = await fetchAPI('/products')
    teas.value = products.filter(p => p.Category?.name === 'Чай')
    mixes.value = products.filter(p => p.Category?.name === 'Чайные смеси')
    utensils.value = products.filter(p => p.Category?.name === 'Чайная утварь')
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

onMounted(loadProducts)
</script>