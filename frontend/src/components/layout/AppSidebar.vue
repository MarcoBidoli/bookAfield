<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
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
</template>

<style scoped>
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
  color: #959595;
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
  transition: all 0.1s ease;
}

.sidebar-menu a.active,
.sidebar-menu a:hover {
  background: rgba(82, 82, 82, 0.15);
}
</style>
