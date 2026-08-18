<script setup>
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="app-shell">
    <!-- Top High-Contrast Glass Navigation Bar -->
    <header class="app-navbar">
      <div class="app-brand">bookAfield</div>

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

    <!-- Main Layout: Full screen Body with Sidebar and Content -->
    <div class="app-body">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-group-title">Navigation</div>

        <ul class="sidebar-menu">
          <li>
            <router-link to="/" active-class="active"> Home </router-link>
          </li>
          <li>
            <router-link to="/fields" active-class="active"> Book a Field </router-link>
          </li>
          <li>
            <router-link to="/tournaments" active-class="active"> Tournaments </router-link>
          </li>
          <li>
            <router-link to="/users" active-class="active"> Users </router-link>
          </li>
          <li v-if="authStore.isAuthenticated">
            <router-link to="/my-bookings" active-class="active"> My Bookings </router-link>
          </li>
        </ul>

        <div v-if="!authStore.isAuthenticated" class="sidebar-group-title">Account Access</div>
        <ul class="sidebar-menu">
          <li v-if="!authStore.isAuthenticated">
            <router-link to="/login" active-class="active"> Login or Register </router-link>
          </li>
        </ul>
      </aside>

      <!-- Right side: content + footer -->
      <div class="main-column">
        <main class="content-area">
          <router-view />
        </main>

        <footer class="app-footer">
          <span>Marco Bidoli</span>
          <span>·</span>
          <span>2026</span>
          <span>·</span>
          <span>Web Application Programming project</span>
        </footer>
      </div>
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

.app-body {
  display: flex;
  flex: 1;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: rgba(240, 242, 245, 0.9);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-right: 1px solid rgba(0, 0, 0, 0.15);
  padding: 20px 12px;
  flex-shrink: 0;
}

.sidebar-group-title {
  color: #3a3a3c;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  padding: 8px 12px 4px;
  letter-spacing: 0.5px;
}

.sidebar-menu {
  list-style: none;
  margin-bottom: 15px;
}

.sidebar-menu li {
  margin-bottom: 2px;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #111113;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sidebar-menu a.active,
.sidebar-menu a:hover {
  background: rgba(0, 81, 199, 0.15);
  color: #0051c7;
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-area {
  flex: 1;
  padding: 32px;
  background: transparent;
  overflow-y: auto;
}

.app-footer {
  min-height: 38px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(240, 242, 245, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  color: #48484a;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}
</style>
