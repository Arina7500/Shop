<template>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchAPI } from '../utils/api'

const stats = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    const userInfo = await fetchAPI('/user')
    if (!userInfo.user || userInfo.user.role !== 'admin') {
      error.value = 'Доступ запрещён. Только для администраторов.'
      return
    }
    stats.value = await fetchAPI('/admin/stats')
  } catch(e) {
    error.value = 'Ошибка загрузки статистики'
  }
})
</script>