<script setup>
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
</script>

<template>
  <header class="app-navbar">
    <div class="app-brand" >
      <router-link to="/" class="app-brand">bookAfield</router-link>
    </div>

    <div class="user-status">
      <template v-if="authStore.isAuthenticated">
        <span class="user-name">{{ authStore.user?.name || authStore.user?.username }}</span>
        <span class="separator">·</span>
        <a href="#" @click.prevent="authStore.logout">logout</a>
      </template>
      <template v-else>
        <router-link to="/login">Sign In</router-link>
      </template>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  height: 52px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.app-brand {
  font-size: 14px;
  font-weight: 800;
  color: #111113;
  text-decoration: none;
}

.user-status {
  font-size: 13px;
  font-weight: 600;
  color: #48484a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-weight: 700;
  color: #111113;
}

.separator {
  color: #8e8e93;
}

.user-status a {
  color: #0051c7;
  text-decoration: none;
  font-weight: 700;
}

.user-status a:hover {
  text-decoration: underline;
}
</style>
