<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchUserById } from '@/api/users'

import AquaPanel from '@/components/AquaPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const tournaments = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const userId = computed(() => route.params.id)

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await fetchUserById(userId.value)

    user.value = data.user
    tournaments.value = data.tournaments || []
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load user tournaments'
  } finally {
    isLoading.value = false
  }
}

function openTournament(tournamentId) {
  router.push(`/tournaments/${tournamentId}`)
}

function formatDate(date) {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('en-GB')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="user-tournaments-view">
    <!-- Breadcrumbs -->
    <Breadcrumbs
      section="Users"
      section-to="/users"
      :current="user ? `${user.name} ${user.surname}` : 'User'"
    />

    <!-- Error -->
    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <!-- Header -->
    <AquaPanel
      :title="
        user
          ? `Tournaments created by ${user.name} ${user.surname} [@${user.username}]`
          : 'User Tournaments'
      "
    >
    </AquaPanel>

    <!-- Loading -->
    <div v-if="isLoading" class="hint-state">Loading tournaments...</div>

    <!-- Empty -->
    <AquaPanel v-else-if="tournaments.length === 0" title="Tournaments">
      <div class="hint-state">This user has not created any tournaments.</div>
    </AquaPanel>

    <!-- Tournaments -->
    <AquaPanel v-else title="Tournaments">
      <div class="tournament-list">
        <div
          v-for="tournament in tournaments"
          :key="tournament._id"
          class="tournament-item"
          @click="openTournament(tournament._id)"
        >
          <div class="tournament-header">
            <div class="tournament-title">
              <span class="tournament-name">
                {{ tournament.name }}
              </span>

              <span class="sport-badge">
                {{ tournament.sport }}
              </span>
            </div>

            <span :class="['status-pill', `status-${tournament.status}`]">
              {{ tournament.status }}
            </span>
          </div>

          <div class="tournament-meta">
            <span> 📅 {{ formatDate(tournament.startDate) }} </span>

            <span> 🏆 {{ tournament.teams?.length || 0 }} / {{ tournament.maxTeams }} teams </span>
          </div>
        </div>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.user-tournaments-view {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.user-name {
  font-weight: bold;
  color: #222;
}

.user-username {
  color: #666;
}

.hint-state {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 16px;
}

.tournament-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tournament-item {
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

.tournament-item:hover {
  border-color: #38a5e8;
  background: #f8fbff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.tournament-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.tournament-name {
  color: #0044bb;
  font-weight: bold;
  font-size: 13px;
}

.sport-badge {
  background: #f0f0f0;
  border: 1px solid #c0c0c0;
  border-radius: 8px;
  padding: 1px 6px;
  font-size: 10px;
  text-transform: capitalize;
  white-space: nowrap;
}

.tournament-meta {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #666;
  flex-wrap: wrap;
}

.status-pill {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-registration {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.status-active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-completed {
  background: #e8e8e8;
  color: #555;
  border: 1px solid #ccc;
}
</style>
