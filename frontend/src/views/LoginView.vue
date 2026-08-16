<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'

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
    <AquaPanel :title="activeTab === 'login' ? 'System Login' : 'User Registration'">
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
      <div v-if="errorMessage" class="error-banner">
        ⚠️ {{ errorMessage }}
      </div>

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
          <AquaButton type="submit" :disabled="isLoading">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </AquaButton>
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
          <AquaButton type="submit" :disabled="isLoading">
            {{ isLoading ? 'Registering...' : 'Register Account' }}
          </AquaButton>
        </div>
      </form>
    </AquaPanel>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 460px;
  margin: 20px auto;
}

.segmented-control {
  display: flex;
  background: #d8d8d8;
  border-radius: 6px;
  padding: 2px;
  margin-bottom: 16px;
  border: 1px solid #b2b2b2;
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: bold;
  color: #555;
  padding: 5px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: linear-gradient(180deg, #ffffff 0%, #e2e2e2 100%);
  color: #111;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.error-banner {
  background-color: #ffe6e6;
  border: 1px solid #ff9999;
  color: #990000;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 10px;
}

label {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

input {
  width: 100%;
  border: 1px solid #8e8e8e;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #ffffff;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

input:focus {
  border-color: #38a5e8;
  box-shadow: 0 0 5px #70c3ff, inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.form-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
