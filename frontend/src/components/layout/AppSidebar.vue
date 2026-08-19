<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isCollapsed = ref(false)

// Automatically start collapsed on mobile screens, but allow manual toggling
onMounted(() => {
  if (window.innerWidth <= 700) {
    isCollapsed.value = true
  }
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const navigation = [
  {
    label: 'Home',
    to: '/',
    icon: 'home',
  },
  {
    label: 'Book a Field',
    to: '/fields',
    icon: 'field',
  },
  {
    label: 'Tournaments',
    to: '/tournaments',
    icon: 'trophy',
  },
  {
    label: 'Users',
    to: '/users',
    icon: 'users',
  },
]
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Navigation -->
    <div class="sidebar-group-title">Navigation</div>

    <ul class="sidebar-menu">
      <li v-for="item in navigation" :key="item.to">
        <router-link :to="item.to" active-class="active" class="sidebar-link" :title="item.label">
          <!-- Home -->
          <svg
            v-if="item.icon === 'home'"
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v11h14V9" />
            <path d="M9 20v-6h6v6" />
          </svg>

          <!-- Field -->
          <svg
            v-else-if="item.icon === 'field'"
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 3v18" />
            <circle cx="12" cy="12" r="3" />
            <path d="M3 8h4v8H3" />
            <path d="M21 8h-4v8h4" />
          </svg>

          <!-- Trophy -->
          <svg
            v-else-if="item.icon === 'trophy'"
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
            <path d="M7 6H4v2a4 4 0 0 0 4 4" />
            <path d="M17 6h3v2a4 4 0 0 1-4 4" />
          </svg>

          <!-- Users -->
          <svg
            v-else-if="item.icon === 'users'"
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>

          <span class="sidebar-label">
            {{ item.label }}
          </span>
        </router-link>
      </li>

      <!-- My Bookings -->
      <li v-if="authStore.isAuthenticated">
        <router-link
          to="/my-bookings"
          active-class="active"
          class="sidebar-link"
          title="My Bookings"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="m9 16 2 2 4-4" />
          </svg>

          <span class="sidebar-label"> My Bookings </span>
        </router-link>
      </li>
    </ul>

    <!-- Push account section to bottom -->
    <div class="sidebar-spacer"></div>

    <!-- Account -->
    <div class="sidebar-group-title">Account</div>

    <ul class="sidebar-menu account-menu">
      <!-- Login -->
      <li v-if="!authStore.isAuthenticated">
        <router-link
          to="/login"
          active-class="active"
          class="sidebar-link"
          title="Login or Register"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>

          <span class="sidebar-label"> Login or Register </span>
        </router-link>
      </li>

      <!-- Logout -->
      <li v-else>
        <button
          type="button"
          class="sidebar-link sidebar-button"
          title="Logout"
          @click="authStore.logout"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>

          <span class="sidebar-label"> Logout </span>
        </button>
      </li>
    </ul>

    <!-- Collapse / Expand Toggle Button -->
    <button
      type="button"
      class="sidebar-link sidebar-button toggle-btn"
      :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      @click="toggleSidebar"
    >
      <svg
        class="sidebar-icon toggle-icon"
        :style="{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span class="sidebar-label">Collapse</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  background: rgba(240, 242, 245, 0.9);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);

  border-right: 1px solid rgba(0, 0, 0, 0.15);

  padding: 20px 12px;

  transition:
    width 0.2s ease,
    padding 0.2s ease;
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
  padding: 0;
  margin: 0 0 15px;
}

.sidebar-menu li {
  margin-bottom: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  height: 38px;
  padding: 0 12px;

  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #111113;

  text-decoration: none;
  border-radius: 8px;

  transition: all 0.15s ease;
}

.sidebar-button {
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.sidebar-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sidebar-link.active,
.sidebar-link:hover {
  background: rgba(82, 82, 82, 0.15);
  color: var(--color-primary);
}

.sidebar-spacer {
  flex: 1;
}

/* Collapsed State Styles (Applies universally on both desktop & mobile) */
.sidebar.collapsed {
  width: 64px;
  padding: 20px 8px;
}

.sidebar.collapsed .sidebar-group-title,
.sidebar.collapsed .sidebar-label {
  display: none;
}

.sidebar.collapsed .sidebar-link {
  justify-content: center;
  padding: 0;
}
</style>
