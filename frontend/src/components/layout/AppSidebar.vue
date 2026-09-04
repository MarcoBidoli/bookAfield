<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SidebarIcon from '@/components/icons/SidebarIcon.vue'

const authStore = useAuthStore()
const isCollapsed = ref(false)

const currentUserId = computed(() => {
  return authStore.userId
})

const currentUserName = computed(() => {
  return authStore.user?.name || authStore.user?.username || 'User'
})

const currentUserUsername = computed(() => {
  return authStore.user?.username || ''
})

const currentUserInitials = computed(() => {
  const name = authStore.user?.name?.trim()
  const surname = authStore.user?.surname?.trim()

  if (name || surname) {
    return `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase()
  }

  return authStore.user?.username?.[0]?.toUpperCase() || '?'
})

const userTournamentsPath = computed(() => {
  return currentUserId.value ? `/users/${currentUserId.value}/tournaments` : '/users'
})

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
    <!-- Header -->
    <div class="sidebar-header">
      <router-link to="/" class="service-name">
        <span v-if="!isCollapsed">bookAfield</span>
      </router-link>

      <button
        type="button"
        class="collapse-button"
        :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        :aria-label="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        @click="toggleSidebar"
      >
        <SidebarIcon :rotated="isCollapsed" />
      </button>
    </div>

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

    <!-- Current user -->
    <router-link
      v-if="authStore.isAuthenticated"
      :to="userTournamentsPath"
      class="sidebar-user"
      :title="`${currentUserName}'s Tournaments`"
    >
      <div class="sidebar-user-avatar">
        {{ currentUserInitials }}
      </div>

      <div class="sidebar-user-info">
        <span class="sidebar-user-name"> {{ currentUserName }} </span>

        <span v-if="currentUserUsername" class="sidebar-user-username">
          @{{ currentUserUsername }}
        </span>
      </div>
    </router-link>

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
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  box-sizing: border-box;

  background: rgba(240, 242, 245, 0.9);

  padding: 12px 0px;

  transition:
    width 0.2s ease,
    padding 0.2s ease;
}

/* Header */

.sidebar-header {
  height: 40px;
  margin-bottom: 12px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 4px 12px;

  box-sizing: content-box;
}

.service-name {
  min-width: 0;

  color: #111113;
  font-size: 15px;
  font-weight: 800;

  text-decoration: none;
  white-space: nowrap;
}

.collapse-button {
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;
  border-radius: 8px;

  background: transparent;
  color: #48484a;

  cursor: pointer;

  transition: background 0.15s ease;
}

.collapse-button:hover {
  background: rgba(82, 82, 82, 0.12);
}

/* Navigation */

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

  box-sizing: border-box;

  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-black);

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
}

.sidebar-link.active,
.sidebar-link:hover {
  background: rgba(82, 82, 82, 0.15);
  color: var(--color-primary);
}

.sidebar-spacer {
  flex: 1;
}

/* User */

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  min-width: 0;

  box-sizing: border-box;

  padding: 8px 10px;
  margin-bottom: 6px;

  border-radius: 10px;

  color: inherit;
  text-decoration: none;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.sidebar-user:hover {
  background: rgba(82, 82, 82, 0.1);
}

.sidebar-user-avatar {
  width: 30px;
  height: 30px;
  flex-shrink: 0;

  font-size: 10px;
  font-weight: 800;

  border-radius: 50%;

  background: linear-gradient(
    135deg,
    var(--color-primary-dark) 0%,
    var(--color-primary-hover-light) 100%
  );

  color: var(--color-white);

  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-user-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--color-black);
  font-size: 12px;
  font-weight: 700;
}

.sidebar-user-username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--color-lightgray-text);
  font-size: 10px;
  font-weight: 500;
}

/* Collapsed */

.sidebar.collapsed {
  width: 45px;
  padding: 12px 8px;
}

.sidebar.collapsed .sidebar-group-title,
.sidebar.collapsed .sidebar-label {
  display: none;
}

.sidebar.collapsed .sidebar-link {
  justify-content: center;
  padding: 0;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.sidebar.collapsed .service-name {
  font-size: 15px;
}

.sidebar.collapsed .collapse-button {
  width: 20px;
  height: 20px;
}

.sidebar.collapsed .sidebar-user {
  justify-content: center;
  padding: 8px 0;
}

.sidebar.collapsed .sidebar-user-info {
  display: none;
}

.sidebar.collapsed .sidebar-user-avatar {
  width: 32px;
  height: 32px;
}

/* mobile tweaks */
@media (max-width: 700px) {
  .sidebar.collapsed {
    width: 32px;
    padding: 12px 0;
  }

  .sidebar.collapsed .sidebar-link {
    width: 32px;
    height: 38px;
    padding: 0;
    justify-content: center;
  }

  /* No active/hover background on mobile */
  .sidebar.collapsed .sidebar-link.active,
  .sidebar.collapsed .sidebar-link:hover {
    background: transparent;
  }

  .sidebar.collapsed .sidebar-icon {
    width: 18px;
    height: 18px;
  }

  .sidebar.collapsed .sidebar-header {
    padding-left: 0;
    padding-right: 0;
  }

  .sidebar.collapsed .collapse-button {
    width: 20px;
    height: 20px;
  }

  .sidebar.collapsed .sidebar-user {
    width: 32px;
    padding: 8px 0;
    justify-content: center;
  }

  .sidebar.collapsed .sidebar-user-avatar {
    width: 28px;
    height: 28px;
  }
}
</style>
