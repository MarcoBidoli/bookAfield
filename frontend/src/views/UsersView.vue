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
    <div v-if="errorMessage" class="banner error-banner">
      <span class="banner-icon">⚠️</span> {{ errorMessage }}
    </div>

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
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading users...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <div class="empty-icon">👤</div>
        <h3>No Users Found</h3>
        <p>Try adjusting your search criteria.</p>
      </div>

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
              <span class="user-name">{{ user.name }} {{ user.surname }}</span>
            </div>
            <span class="user-chevron">›</span>
          </div>

          <div class="user-meta">
            <span class="username-tag">@{{ user.username }}</span>
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
  gap: 20px;
}

.banner {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.error-banner {
  background: rgba(255, 59, 48, 0.12);
  border: 1px solid rgba(255, 59, 48, 0.25);
  color: #b71c1c;
}

/* Search */
.filter-bar {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-pill {
  flex: 1;
  min-width: 240px;
  border-radius: 980px !important;
  padding: 0 14px 0 36px !important;
  height: 36px !important;
  background: rgba(255, 255, 255, 0.95)
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2348484a' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E")
  12px center no-repeat !important;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 12px;
  font-weight: 600;
  outline: none;
  color: #111113;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-pill:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 20px;
  gap: 12px;
  color: #48484a;
}

.loading-state span,
.empty-state p {
  font-size: 13px;
  font-weight: 500;
  color: #48484a;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: #111113;
  margin: 0;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 113, 227, 0.15);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Users */
.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.user-item {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 16px 20px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.user-item:hover {
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 6px 24px rgba(0, 113, 227, 0.08);
  background: rgba(255, 255, 255, 0.96);
  transform: translateY(-1px);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.user-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.user-name {
  color: #0071e3;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: -0.2px;
}

.user-chevron {
  font-size: 16px;
  color: #8e8e93;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.user-item:hover .user-chevron {
  color: #0071e3;
  transform: translateX(2px);
}

.user-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #48484a;
  font-weight: 500;
}

.username-tag {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 2px 8px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 600;
  color: #48484a;
}
</style>
