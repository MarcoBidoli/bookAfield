<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import AquaPanel from '../components/AquaPanel.vue'
import AquaButton from '../components/AquaButton.vue'

const username = ref('')
const password = ref('')

const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  try {
    await authStore.performLogin({
      username: username.value,
      password: password.value
    })

    router.push('/')
  } catch (error) {
    alert('Login failed!')
  }
}
</script>

<template>
  <AquaPanel title="System Login">
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">
          Username:
        </label>

        <input
          id="username"
          v-model="username"
          type="text"
          autocomplete="username"
        />
      </div>

      <div class="password-field">
        <label for="password">
          Password:
        </label>

        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
        />
      </div>

      <AquaButton
        type="submit"
        class="login-button"
      >
        Login
      </AquaButton>
    </form>
  </AquaPanel>
</template>

<style scoped>
input {
  width: 100%;
  border: 1px solid #8e8e8e;
  padding: 4px;
  border-radius: 4px;
}

.password-field {
  margin-top: 10px;
}

.login-button {
  margin-top: 15px;
}
</style>
