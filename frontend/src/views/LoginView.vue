<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import AppBanner from '@/components/AppBanner.vue'
import Switcher from '@/components/Switcher.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const errorMessage = ref('')
const isLoading = ref(false)

const authTabs = [
  {
    value: 'login',
    label: 'Sign In',
  },
  {
    value: 'register',
    label: 'Register New Account',
  },
]

const loginForm = reactive({
  username: '',
  password: '',
})

const registerForm = reactive({
  username: '',
  name: '',
  surname: '',
  password: '',
  confirmPassword: '',
})

watch(activeTab, () => {
  errorMessage.value = ''
})

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await authStore.performLogin({
      username: loginForm.username,
      password: loginForm.password,
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
      password: registerForm.password,
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
    <Panel
      :title="
        activeTab === 'login'
          ? 'System Login'
          : 'User Registration'
      "
    >
      <Switcher
        v-model="activeTab"
        :options="authTabs"
      />

      <AppBanner
        v-if="errorMessage"
        type="error"
        :message="errorMessage"
      />

      <!-- Login -->
      <form
        v-if="activeTab === 'login'"
        class="auth-form"
        @submit.prevent="handleLogin"
      >
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
          <Button
            type="submit"
            variant="primary"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </Button>
        </div>
      </form>

      <!-- Registration -->
      <form
        v-else
        class="auth-form"
        @submit.prevent="handleRegister"
      >
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
          <label for="reg-confirm-password">
            Confirm Password
          </label>

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
          <Button
            type="submit"
            variant="primary"
            :disabled="isLoading"
          >
            {{
              isLoading
                ? 'Registering...'
                : 'Register Account'
            }}
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

@media (max-width: 500px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
