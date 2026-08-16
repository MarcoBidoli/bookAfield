<script setup>
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="app-shell">
    <header class="app-navbar">
      <div class="app-brand">
        bookAfield
      </div>

      <div
        v-if="authStore.isAuthenticated"
        class="user-status"
      >
        {{ authStore.user.username }}
        |
        <a href="#" @click.prevent="authStore.logout">logout</a>
      </div>
    </header>

    <div class="app-body">
      <aside class="sidebar">
        <ul class="sidebar-menu">
          <li>
            <router-link to="/">
              Dashboard
            </router-link>
          </li>

          <li v-if="!authStore.isAuthenticated">
            <router-link to="/login">
              Login
            </router-link>
          </li>
        </ul>
      </aside>

      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-navbar {
  background: linear-gradient(
    180deg,
    #e6e6e6 0%,
    #bcbcbc 100%
  );
  border-bottom: 1px solid #777;
  height: 42px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-body {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
  background: linear-gradient(
    180deg,
    #d6dde5 0%,
    #c1cbe0 100%
  );
  border-right: 1px solid #999;
}

.sidebar-menu {
  list-style: none;
}

.sidebar-menu li a {
  display: block;
  padding: 8px 16px;
  color: #111;
}

.content-area {
  flex-grow: 1;
  padding: 24px;
}
</style>
