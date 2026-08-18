<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import AppBanner from '@/components/AppBanner.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login') // 'login' | 'register'
const errorMessage = ref('')
const isLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  name: '',
  surname: '',
  password: '',
  confirmPassword: ''
})

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    await authStore.performLogin({
      username: loginForm.username,
      password: loginForm.password
    })
    router.push('/')
  } catch (err) {
    errorMessage.value = err.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  errorMessage.value = ''
  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  isLoading.value = true
  try {
    await authStore.performSignup({
      username: registerForm.username,
      name: registerForm.name,
      surname: registerForm.surname,
      password: registerForm.password
    })
    router.push('/')
  } catch (err) {
    errorMessage.value = err.message || 'Registration failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <Panel :title="activeTab === 'login' ? 'System Login' : 'User Registration'">
      <!-- Segmented Tab Switcher -->
      <div class="segmented-control">
        <button
          type="button"
          :class="['tab-btn', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'; errorMessage = ''"
        >
          Sign In
        </button>
        <button
          type="button"
          :class="['tab-btn', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'; errorMessage = ''"
        >
          Register New Account
        </button>
      </div>

      <!-- Error Alert -->
      <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login-username">Username</label>
          <input
            id="login-username"
            v-model="loginForm.username"
            type="text"
            required
            autocomplete="username"
            placeholder="e.g. mario_rossi"
          />
        </div>

        <div class="form-group">
          <label for="login-password">Password</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <div class="form-actions">
          <Button type="submit" variant="primary" :disabled="isLoading">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </Button>
        </div>
      </form>

      <!-- Registration Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="reg-username">Username</label>
          <input
            id="reg-username"
            v-model="registerForm.username"
            type="text"
            required
            autocomplete="username"
            placeholder="Choose a username"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="reg-name">First Name</label>
            <input
              id="reg-name"
              v-model="registerForm.name"
              type="text"
              required
              autocomplete="given-name"
              placeholder="e.g. Mario"
            />
          </div>

          <div class="form-group">
            <label for="reg-surname">Last Name / Surname</label>
            <input
              id="reg-surname"
              v-model="registerForm.surname"
              type="text"
              required
              autocomplete="family-name"
              placeholder="e.g. Rossi"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-password">Password</label>
          <input
            id="reg-password"
            v-model="registerForm.password"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Create password"
          />
        </div>

        <div class="form-group">
          <label for="reg-confirm-password">Confirm Password</label>
          <input
            id="reg-confirm-password"
            v-model="registerForm.confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Repeat password"
          />
        </div>

        <div class="form-actions">
          <Button type="submit" variant="primary" :disabled="isLoading">
            {{ isLoading ? 'Registering...' : 'Register Account' }}
          </Button>
        </div>
      </form>
    </Panel>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 460px;
  margin: 40px auto;
}

.segmented-control {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #48484a;
  padding: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.tab-btn.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  font-weight: 700;
}

.tab-btn:hover:not(.active) {
  color: #111113;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 12px;
}

label {
  font-size: 13px;
  font-weight: 700;
  color: #111113;
}

input {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #111113;
  background: #ffffff;
  outline: none;
  transition: all 0.1s ease;
}

input:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.form-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
