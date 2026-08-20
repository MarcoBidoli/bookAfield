<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {fetchUsers} from '@/api/users'

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

    return (
      fullName.includes(query) ||
      username.includes(query)
    )
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

onMounted(loadUsers)
</script>

<template>
  <div class="users-view">
    <Breadcrumbs
      section="Users"
      section-to="/users"
      current="User Directory"
    />

    <PageHeader
      title="Users"
      subtitle="Browse users and view their tournaments"
    />

    <AppBanner
      v-if="errorMessage"
      type="error"
      :message="errorMessage"
    />

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
        search-placeholder="Filter users by name or username..."
      />

      <LoadingState
        v-if="isLoading"
        message="Loading users..."
      />

      <EmptyState
        v-else-if="filteredUsers.length === 0"
        title="No Users Found"
        message="Try adjusting your search criteria."
      />

      <div
        v-else
        class="user-list"
      >
        <article
          v-for="user in filteredUsers"
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
              <span class="user-name">
                {{ user.name }} {{ user.surname }}
              </span>
            </div>

            <span class="user-chevron">
              →
            </span>
          </div>

          <div class="user-meta">
            <Pill variant="default">
              @{{ user.username }}
            </Pill>
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
  grid-template-columns: repeat(
    auto-fill,
    minmax(280px, 1fr)
  );
  gap: 14px;
}

.user-item {
  background: var(--color-white);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 16px 20px;
  cursor: pointer;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  display: flex;
  flex-direction: column;
  gap: 10px;

  transition: all 0.1s ease;
}

.user-item:hover,
.user-item:focus-visible {
  border-color: rgba(0, 113, 227, 0.3);

  box-shadow:
    0 8px 24px rgba(0, 113, 227, 0.08);

  outline: none;
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
  transform: translateX(2px);
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
