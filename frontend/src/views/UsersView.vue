<script setup>
import { fetchUsers } from '@/api/users'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BasePanel from '@/components/BasePanel.vue'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterToolbar from '@/components/FilterToolbar.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppBanner from '@/components/AppBanner.vue'
import StatusPill from '@/components/StatusPill.vue'

const router = useRouter()
const route = useRoute()

const users = ref([])
const searchQuery = ref(route.query.q || '')
const isLoading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(!!route.query.q)

let debounceTimer = null

async function searchUsers(query = searchQuery.value) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    users.value = []
    hasSearched.value = false
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  hasSearched.value = true

  try {
    users.value = await fetchUsers(trimmedQuery)
  } catch (err) {
    errorMessage.value = err.message || 'Error loading users'
    users.value = []
  } finally {
    isLoading.value = false
  }
}

// Automatically search as the user types (debounced by 300ms)
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    const routeQuery = { ...route.query }
    const trimmedQuery = newQuery.trim()

    if (trimmedQuery) {
      routeQuery.q = trimmedQuery
    } else {
      delete routeQuery.q
    }

    router.replace({ query: routeQuery })

    searchUsers(trimmedQuery)
  }, 300)
})

watch(
  () => route.query.q,
  (newSearch) => {
    const value = newSearch || ''

    if (value !== searchQuery.value) {
      searchQuery.value = value
    }
  },
)

function openUserTournaments(userId) {
  router.push(`/users/${userId}/tournaments`)
}
</script>

<template>
  <div class="users-view">
    <AppBreadcrumbs section="Users" section-to="/users" current="Search Users" />

    <PageHeader title="Users" subtitle="Browse users and view their tournaments" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <BasePanel title="Users">
      <FilterToolbar
        v-model="searchQuery"
        model-filter="all"
        :filters="[
          {
            label: 'All Users',
            value: 'all',
          },
        ]"
        search-placeholder="Search users by name or username..."
      />

      <LoadingState v-if="isLoading" message="Searching users..." />

      <EmptyState
        v-else-if="!hasSearched"
        title="Search Users"
        message="Type a name or username in the search box above."
      />

      <EmptyState
        v-else-if="users.length === 0"
        title="No Users Found"
        message="Try adjusting your search criteria."
      />

      <div v-else class="user-list">
        <button
          v-for="user in users"
          :key="user._id"
          type="button"
          class="user-item"
          @click="openUserTournaments(user._id)"
        >
          <span class="user-header">
            <span class="user-title">
              <span class="user-name"> {{ user.name }} {{ user.surname }} </span>
            </span>

            <span class="user-chevron"> → </span>
          </span>

          <span class="user-meta">
            <StatusPill variant="default"> @{{ user.username }} </StatusPill>
          </span>
        </button>
      </div>
    </BasePanel>
  </div>
</template>

<style scoped>
.users-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.user-item {
  width: 100%;
  text-align: left;
  font-family: inherit;
  background: var(--color-white);
  border: 1px solid var(--card-border-color);
  border-radius: 14px;
  padding: 16px 20px;
  cursor: pointer;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  display: flex;
  flex-direction: column;
  gap: 10px;

  transition: all 0.1s ease;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.user-title {
  min-width: 0;
}

.user-name {
  color: var(--color-black);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: -0.2px;
}

.user-item:hover .user-name,
.user-item:focus-visible .user-name {
  color: var(--color-primary);
}

.user-chevron {
  flex-shrink: 0;

  color: #8e8e93;
  font-size: 16px;
  font-weight: 600;

  transition: all 0.1s ease;
}

.user-item:hover .user-chevron,
.user-item:focus-visible .user-chevron {
  color: var(--color-primary);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 16px;

  font-size: 12px;
  color: var(--color-darkgray);
  font-weight: 500;
}

@media (max-width: 600px) {
  .user-list {
    grid-template-columns: 1fr;
  }
}
</style>
