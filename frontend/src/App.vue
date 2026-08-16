<script setup>
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="app-shell">
    <!-- Top Aqua Navigation Bar -->
    <header class="app-navbar">
      <div class="app-brand">
        bookAfield
      </div>

      <div class="user-status">
        <template v-if="authStore.isAuthenticated">
          <span class="user-name">{{ authStore.user?.name || authStore.user?.username }}</span>
          |
          <a href="#" @click.prevent="authStore.logout">logout</a>
        </template>
        <template v-else>
          <router-link to="/login">Sign In</router-link>
        </template>
      </div>
    </header>

    <!-- Main Layout: Full screen Body with Sidebar and Content -->
    <div class="app-body">
      <!-- Aqua Source List Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-group-title">Navigation</div>
        <ul class="sidebar-menu">
          <li>
            <router-link to="/" active-class="active">
              Active Fields & Cups
            </router-link>
          </li>
          <li>
            <router-link to="/fields" active-class="active">
              Book a Field
            </router-link>
          </li>
          <li v-if="authStore.isAuthenticated">
            <router-link to="/my-bookings" active-class="active">
              My Bookings
            </router-link>
          </li>
          <li v-if="!authStore.isAuthenticated">
            <router-link to="/login" active-class="active">
              Account Access
            </router-link>
          </li>
        </ul>
      </aside>

      <!-- Main Content View Area -->
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
  width: 100%;
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
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.app-brand {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

.user-status {
  font-size: 11px;
  color: #444;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

.user-name {
  font-weight: bold;
}

.user-status a {
  color: #0044bb;
  text-decoration: none;
}

.user-status a:hover {
  text-decoration: underline;
}

.app-body {
  display: flex;
  flex: 1;
}

/* Aqua Source List Sidebar */
.sidebar {
  width: 220px;
  background: linear-gradient(
    180deg,
    #d6dde5 0%,
    #c1cbe0 100%
  );
  border-right: 1px solid #999;
  padding: 15px 0;
  flex-shrink: 0;
}

.sidebar-group-title {
  font-size: 11px;
  font-weight: bold;
  color: #556677;
  padding: 8px 16px 4px 16px;
  text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}

.sidebar-menu {
  list-style: none;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  font-size: 12px;
  color: #111;
  text-decoration: none;
  font-weight: 500;
}

.sidebar-menu a.active,
.sidebar-menu a:hover {
  background: linear-gradient(
    180deg,
    #5ca0f2 0%,
    #1a62d6 100%
  );
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.content-area {
  flex-grow: 1;
  padding: 24px;
  background-color: #ededed;
  overflow-y: auto;
}
</style>
