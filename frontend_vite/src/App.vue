<template>
  <div>
    <NavComponent />
    <h1>Хэ Цзин И</h1>
    <h5>Гармония Уважение Истина</h5>
    <router-view />
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-col footer-about">
            <h3 class="footer-logo">Хэ Цзин И</h3>
            <p class="footer-tagline">Гармония · Уважение · Истина</p>
          </div>
          <div class="footer-col footer-menu">
            <h4 class="footer-title">Навигация</h4>
            <ul class="footer-links">
              <li><a href="/" @click.prevent="$router.push('/')">Главная</a></li>
              <li><a href="/catalog" @click.prevent="$router.push('/catalog')">Каталог</a></li>
              <li><a href="/about">О нас</a></li>
            </ul>
          </div>
          <div class="footer-col footer-contact">
            <h4 class="footer-title">Контакты</h4>
            <ul class="footer-contact-list">
              <li>г. Москва, ул. Чайная, д. 42</li>
              <li>+7 (999) 123-45-67</li>
              <li>info@hejingyi.ru</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 Хэ Цзин И. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import NavComponent from './components/NavComponent.vue'
</script>

<style>
/* глобальные стили можно добавить сюда, но лучше они уже есть в public/css */
</style>