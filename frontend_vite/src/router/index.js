import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import CatalogPage from '../pages/CatalogPage.vue'
import CartPage from '../pages/CartPage.vue'
import AdminPage from '../pages/AdminPage.vue'

const routes = [
    { path: '/', component: HomePage },
    { path: '/catalog', component: CatalogPage },
    { path: '/cart', component: CartPage },
    { path: '/admin', component: AdminPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router