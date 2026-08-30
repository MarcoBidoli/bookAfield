<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchUsers } from '@/api/users'

import Panel from '@/components/Panel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterToolbar from '@/components/FilterToolbar.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppBanner from '@/components/AppBanner.vue'
import Pill from '@/components/Pill.vue'

const router = useRouter()

const users = ref([])
const searchQuery = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const hasSearched = ref(false)

let debounceTimer = null

async function searchUsers(query) {
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
    // Calls API with the search query (e.g. /api/users?q=searchname)
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
    searchUsers(newQuery)
  }, 300)
})

function openUserTournaments(userId) {
  router.push(`/users/${userId}/tournaments`)
}
</script>

<template>
  <div class="users-view">
    <Breadcrumbs section="Users" section-to="/users" current="Search Users" />

    <PageHeader title="Users" subtitle="Browse users and view their tournaments" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <Panel title="Users">
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
        <article
          v-for="user in users"
          :key="user._id"
          class="user-item"
          role="button"
          tabindex="0"
          @click="openUserTournaments(user._id)"
          @keydown.enter="openUserTournaments(user._id)"
          @keydown.space.prevent="openUserTournaments(user._id)"
        >
          <div class="user-header">
            <div class="user-title">
              <span class="user-name"> {{ user.name }} {{ user.surname }} </span>
            </div>

            <span class="user-chevron"> → </span>
          </div>

          <div class="user-meta">
            <Pill variant="default"> @{{ user.username }} </Pill>
          </div>
        </article>
      </div>
    </Panel>
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
