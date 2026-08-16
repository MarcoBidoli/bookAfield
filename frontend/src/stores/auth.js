import {defineStore} from 'pinia';
import {computed, ref} from "vue";
import {fetchCurrentUser, login} from "@/api/auth.js";

export const useAuthStore= defineStore('auth', () => {
  const user = ref(null);

  const isAuthenticated = computed(() => !!user.value);

  async function checkAuth() {
    user.value = await fetchCurrentUser();
  }

  async function performLogin(credentials) {
    const data = await login(credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    user.value = data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    checkAuth,
    performLogin,
    logout
  }
});
