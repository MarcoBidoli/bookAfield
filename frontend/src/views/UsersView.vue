<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchUsers } from '@/api/users'

import AquaPanel from '@/components/AquaPanel.vue'

const router = useRouter()

const users = ref([])
const searchQuery = ref('')
const isLoading = ref(true)
const errorMessage = ref('')

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return users.value
  }

  return users.value.filter((user) => {
    const fullName = `${user.name || ''} ${user.surname || ''}`.toLowerCase()
    const username = (user.username || '').toLowerCase()

    return fullName.includes(query) || username.includes(query)
  })
})

async function loadUsers() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    users.value = await fetchUsers()
  } catch (err) {
    errorMessage.value = err.message || 'Error loading users'
  } finally {
    isLoading.value = false
  }
}

function openUserTournaments(userId) {
  router.push(`/users/${userId}/tournaments`)
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="users-view">
    <!-- Feedback -->
    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <!-- Users Directory -->
    <AquaPanel title="Users">
      <!-- Search Bar -->
      <div class="filter-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-pill"
          placeholder="Filter users by name or username..."
        />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="hint-state">Loading users...</div>

      <!-- Empty -->
      <div v-else-if="filteredUsers.length === 0" class="hint-state">No users found.</div>

      <!-- Users -->
      <div v-else class="user-list">
        <div
          v-for="user in filteredUsers"
          :key="user._id"
          class="user-item"
          @click="openUserTournaments(user._id)"
        >
          <div class="user-header">
            <div class="user-title">
              <span class="user-name"> {{ user.name }} {{ user.surname }} </span>
            </div>
          </div>

          <div class="user-meta">
            <span> @{{ user.username }} </span>
          </div>
        </div>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.users-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.error-banner {
  background-color: #ffe6e6;
  border: 1px solid #ff9999;
  color: #990000;
}

/* Search */

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.search-pill {
  flex: 1;
  min-width: 220px;
  border-radius: 14px !important;
  padding: 6px 10px 6px 26px !important;
  background: #ffffff
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E")
    8px center no-repeat !important;
  border: 1px solid #8e8e8e;
  font-size: 12px;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

.search-pill:focus {
  border-color: #38a5e8;
  box-shadow:
    0 0 5px #70c3ff,
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Users */

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 12px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.user-item:hover {
  border-color: #38a5e8;
  background: #f8fbff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 5px;
}

.user-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.user-name {
  color: #0044bb;
  font-weight: bold;
  font-size: 13px;
}

.user-meta {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #666;
  flex-wrap: wrap;
}

.hint-state {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 16px;
}
</style>
