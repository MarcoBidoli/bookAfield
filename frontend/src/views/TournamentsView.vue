<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchTournaments,
  createTournament,
  deleteTournament
} from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const tournaments = ref([])
const searchQuery = ref('')
const selectedSportFilter = ref('all')
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const newTournament = reactive({
  name: '',
  sport: 'football',
  maxTeams: 4,
  startDate: getTomorrowDate()
})

function getTomorrowDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

async function loadTournaments() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const list = await fetchTournaments(searchQuery.value)
    tournaments.value = list
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load tournaments'
  } finally {
    isLoading.value = false
  }
}

async function handleCreateTournament() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const created = await createTournament({
      name: newTournament.name,
      sport: newTournament.sport,
      maxTeams: Number(newTournament.maxTeams),
      startDate: newTournament.startDate
    })

    successMessage.value = `Tournament "${created.name}" created successfully!`
    // Reset form
    newTournament.name = ''
    newTournament.maxTeams = 4

    // Refresh list
    await loadTournaments()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to create tournament'
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(t) {
  const confirmDelete = window.confirm(`Delete tournament "${t.name}" and all scheduled matches?`)
  if (!confirmDelete) return

  errorMessage.value = ''
  successMessage.value = ''
  try {
    await deleteTournament(t._id)
    successMessage.value = `Tournament "${t.name}" deleted.`
    tournaments.value = tournaments.value.filter(item => item._id !== t._id)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to delete tournament'
  }
}

function isCreator(t) {
  if (!authStore.isAuthenticated || !authStore.user) return false
  const currentUserId = authStore.user._id || authStore.user.id
  return String(t.creatorId) === String(currentUserId)
}

function filteredTournaments() {
  if (selectedSportFilter.value === 'all') {
    return tournaments.value
  }
  return tournaments.value.filter(t => t.sport === selectedSportFilter.value)
}

onMounted(() => {
  loadTournaments()
})
</script>

<template>
  <div class="tournaments-view">
    <!-- Feedback Alerts -->
    <div v-if="successMessage" class="banner success-banner">
      ✓ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="banner error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Create Tournament Panel (Authenticated users) -->
    <AquaPanel title="Create New Tournament">
      <div v-if="!authStore.isAuthenticated" class="auth-notice">
        <span>Sign in to host and manage sports tournaments.</span>
        <router-link to="/login">
          <AquaButton style="margin-left: 10px;">Sign In</AquaButton>
        </router-link>
      </div>

      <form v-else @submit.prevent="handleCreateTournament" class="create-form">
        <div class="form-row">
          <div class="form-group flex-2">
            <label for="t-name">Tournament Name:</label>
            <input
              id="t-name"
              v-model="newTournament.name"
              type="text"
              required
              placeholder="e.g. Summer Cup 2026"
            />
          </div>

          <div class="form-group flex-1">
            <label for="t-sport">Sport:</label>
            <select id="t-sport" v-model="newTournament.sport">
              <option value="football">Football</option>
              <option value="volleyball">Volleyball</option>
              <option value="basketball">Basketball</option>
            </select>
          </div>

          <div class="form-group flex-1">
            <label for="t-teams">Max Teams:</label>
            <input
              id="t-teams"
              v-model.number="newTournament.maxTeams"
              type="number"
              min="2"
              max="32"
              required
            />
          </div>

          <div class="form-group flex-1">
            <label for="t-date">Start Date:</label>
            <input
              id="t-date"
              v-model="newTournament.startDate"
              type="date"
              required
            />
          </div>
        </div>

        <div class="actions-right">
          <AquaButton type="submit" :disabled="isSubmitting || !newTournament.name">
            {{ isSubmitting ? 'Creating...' : 'Create Tournament' }}
          </AquaButton>
        </div>
      </form>
    </AquaPanel>

    <!-- Tournaments Directory & Management -->
    <AquaPanel title="Tournaments & League Cups">
      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-pill"
          placeholder="Search tournament, team or player name..."
          @input="loadTournaments"
        />

        <div class="sport-filters">
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'all' }]"
            @click="selectedSportFilter = 'all'"
          >
            All
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'football' }]"
            @click="selectedSportFilter = 'football'"
          >
            Football
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'basketball' }]"
            @click="selectedSportFilter = 'basketball'"
          >
            Basketball
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'volleyball' }]"
            @click="selectedSportFilter = 'volleyball'"
          >
            Volleyball
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="hint-state">
        Loading tournaments...
      </div>

      <div v-else-if="filteredTournaments().length === 0" class="hint-state">
        No tournaments found.
      </div>

      <!-- Tournament Cards Grid -->
      <div v-else class="tournament-list">
        <div
          v-for="t in filteredTournaments()"
          :key="t._id"
          class="tournament-card"
        >
          <div class="card-main">
            <div class="card-title-row">
              <router-link :to="`/tournaments/${t._id}`" class="card-title">
                {{ t.name }}
              </router-link>
              <span class="sport-badge">{{ t.sport }}</span>
              <span :class="['status-badge', `status-${t.status}`]">
                {{ t.status }}
              </span>
            </div>

            <div class="card-meta">
              <span>📅 Starts: <strong>{{ t.startDate }}</strong></span>
              <span>👥 Teams: <strong>{{ t.teams ? t.teams.length : 0 }} / {{ t.maxTeams }}</strong></span>
            </div>
          </div>

          <!-- Action Links -->
          <div class="card-actions">
            <router-link :to="`/tournaments/${t._id}`" class="action-link">
              Details & Teams
            </router-link>
            <span class="divider">|</span>
            <router-link :to="`/tournaments/${t._id}/matches`" class="action-link">
              Matches
            </router-link>
            <span class="divider">|</span>
            <router-link :to="`/tournaments/${t._id}/standings`" class="action-link">
              Standings
            </router-link>
            <template v-if="isCreator(t)">
              <span class="divider">|</span>
              <button
                type="button"
                class="btn-delete"
                @click="handleDelete(t)"
              >
                Delete
              </button>
            </template>
          </div>
        </div>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.tournaments-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.success-banner {
  background-color: #e6f7ec;
  border: 1px solid #70c995;
  color: #155724;
}

.error-banner {
  background-color: #ffe6e6;
  border: 1px solid #ff9999;
  color: #990000;
}

.auth-notice {
  font-size: 12px;
  color: #555;
  display: flex;
  align-items: center;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flex-1 { flex: 1; min-width: 130px; }
.flex-2 { flex: 2; min-width: 200px; }

label {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

input, select {
  background: #ffffff;
  border: 1px solid #8e8e8e;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 12px;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

input:focus, select:focus {
  border-color: #38a5e8;
  box-shadow: 0 0 5px #70c3ff, inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.actions-right {
  display: flex;
  justify-content: flex-end;
}

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
  padding-left: 26px !important;
  background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") 8px center no-repeat !important;
}

.sport-filters {
  display: flex;
  gap: 4px;
  background: #d8d8d8;
  border: 1px solid #b2b2b2;
  border-radius: 6px;
  padding: 2px;
}

.filter-btn {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: bold;
  color: #444;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-btn.active {
  background: linear-gradient(180deg, #ffffff 0%, #e2e2e2 100%);
  color: #111;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tournament-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tournament-card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
  gap: 10px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-title {
  color: #0044bb;
  font-weight: bold;
  font-size: 13px;
  text-decoration: none;
}

.card-title:hover {
  text-decoration: underline;
}

.sport-badge {
  background: #f0f0f0;
  border: 1px solid #c0c0c0;
  border-radius: 8px;
  padding: 1px 6px;
  font-size: 10px;
  text-transform: capitalize;
}

.status-badge {
  padding: 1px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  text-transform: capitalize;
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
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.card-meta {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #666;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.action-link {
  color: #0044bb;
  text-decoration: none;
  font-weight: 500;
}

.action-link:hover {
  text-decoration: underline;
}

.divider {
  color: #aaa;
}

.btn-delete {
  background: none;
  border: none;
  color: #c02020;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  padding: 0;
}

.btn-delete:hover {
  text-decoration: underline;
}

.hint-state {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 16px;
}
</style>
