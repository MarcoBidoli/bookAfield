import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from "@/stores/auth.js";

import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import FieldsView from "@/views/FieldsView.vue";
import UserBookingsView from "@/views/UserBookingsView.vue";
import TournamentsView from "@/views/TournamentsView.vue";
import TournamentDetailView from "@/views/TournamentDetailView.vue";
import MatchesView from "@/views/MatchesView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/fields',
      name: 'fields',
      component: FieldsView
    },
    {
      path: '/tournaments',
      name: 'tournaments',
      component: TournamentsView
    },
    {
      path: '/tournaments/:id',
      name: 'tournament-detail',
      component: TournamentDetailView
    },
    {
      path: '/tournaments/:id/matches',
      name: 'tournament-matches',
      component: MatchesView
    },
    {
      path: '/my-bookings',
      name: 'my-bookings',
      component: UserBookingsView,
      meta: { requiresAuth: true }
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

  // Protect authenticated routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
});

export default router
