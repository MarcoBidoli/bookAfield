import {defineStore} from 'pinia';
import {computed, ref} from "vue";
import {fetchCurrentUser, login, signup} from "@/api/auth.js";

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);

  const isAuthenticated = computed(() => !!user.value);
  const userId = computed(() => user.value?._id || user.value?.id || null);

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

  async function performSignup(userData) {
    await signup(userData);

    // Auto-login after successful registration
    await performLogin({
      username: userData.username,
      password: userData.password
    });
  }

  function logout() {
    localStorage.removeItem('token');
    user.value = null;
  }

  return {
    user,
    userId,
    isAuthenticated,
    checkAuth,
    performLogin,
    performSignup,
    logout
  }
});
