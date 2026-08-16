import { createRouter, createWebHistory } from 'vue-router'
import {useAuthStore} from "../stores/auth.js";

import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ],
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // Run initial token verification once if token exists
  if (authStore.user === null && localStorage.getItem('token')) {
    await authStore.checkAuth()
  }

  // Redirect to home if already logged in and trying to access /login
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' }
  }
});

export default router
