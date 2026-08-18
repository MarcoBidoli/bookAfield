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
      <span class="banner-icon">✓</span> {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="banner error-banner">
      <span class="banner-icon">⚠️</span> {{ errorMessage }}
    </div>

    <!-- Create Tournament Panel -->
    <AquaPanel title="Create New Tournament">
      <div v-if="!authStore.isAuthenticated" class="auth-notice">
        <span>Sign in to host and manage sports tournaments.</span>
        <router-link to="/login">
          <AquaButton class="auth-btn">Sign In</AquaButton>
        </router-link>
      </div>

      <form v-else @submit.prevent="handleCreateTournament" class="create-form">
        <div class="form-row">
          <div class="form-group flex-2">
            <label for="t-name">Tournament Name</label>
            <input
              id="t-name"
              v-model="newTournament.name"
              type="text"
              required
              placeholder="e.g. Summer Cup 2026"
            />
          </div>

          <div class="form-group flex-1">
            <label for="t-sport">Sport</label>
            <select id="t-sport" v-model="newTournament.sport">
              <option value="football">Football</option>
              <option value="volleyball">Volleyball</option>
              <option value="basketball">Basketball</option>
            </select>
          </div>

          <div class="form-group flex-1">
            <label for="t-teams">Max Teams</label>
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
            <label for="t-date">Start Date</label>
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
            {{ isSubmitting ? 'Creating...' : 'Post Tournament' }}
          </AquaButton>
        </div>
      </form>
    </AquaPanel>

    <!-- Tournaments Directory & Feed -->
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

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading tournaments feed...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTournaments().length === 0" class="empty-state">
        <div class="empty-icon">🏆</div>
        <h3>No Tournaments Found</h3>
        <p>Try adjusting your search criteria or filters.</p>
      </div>

      <!-- Tournament Feed (Tweet Style) -->
      <div v-else class="tweet-feed">
        <div
          v-for="t in filteredTournaments()"
          :key="t._id"
          class="tweet-card"
        >
          <!-- Tweet Header -->
          <div class="tweet-header">
            <div class="tweet-author">
              <div class="author-avatar">
                {{ t.sport === 'football' ? '⚽' : t.sport === 'basketball' ? '🏀' : '🏐' }}
              </div>
              <div class="author-details">
                <router-link :to="`/tournaments/${t._id}`" class="tweet-title">
                  {{ t.name }}
                </router-link>
                <div class="tweet-meta-tags">
                  <span class="sport-badge">{{ t.sport }}</span>
                  <span class="date-tag">📅 {{ t.startDate }}</span>
                </div>
              </div>
            </div>
            <span :class="['status-pill', `status-${t.status}`]">
              {{ t.status }}
            </span>
          </div>

          <!-- Tweet Content / Metrics -->
          <div class="tweet-content">
            <div class="tournament-stats-bar">
              👥 <strong>{{ t.teams ? t.teams.length : 0 }}</strong> / {{ t.maxTeams }} Teams Registered
            </div>
          </div>

          <!-- Tweet Footer / Action Buttons -->
          <div class="tweet-footer">
            <div class="tweet-actions-group">
              <router-link :to="`/tournaments/${t._id}`" class="tweet-action-btn">
                Details & Teams
              </router-link>
              <router-link :to="`/tournaments/${t._id}/matches`" class="tweet-action-btn">
                Matches
              </router-link>
              <router-link :to="`/tournaments/${t._id}/standings`" class="tweet-action-btn">
                Standings
              </router-link>
            </div>

            <template v-if="isCreator(t)">
              <button
                type="button"
                class="btn-delete-tweet"
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
  gap: 20px;
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
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

.success-banner {
  background: rgba(52, 199, 89, 0.12);
  border: 1px solid rgba(52, 199, 89, 0.25);
  color: #1b5e20;
}

.error-banner {
  background: rgba(255, 59, 48, 0.12);
  border: 1px solid rgba(255, 59, 48, 0.25);
  color: #b71c1c;
}

.auth-notice {
  font-size: 13px;
  color: #48484a;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.auth-btn {
  margin-left: 10px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flex-1 { flex: 1; min-width: 140px; }
.flex-2 { flex: 2; min-width: 220px; }

label {
  font-size: 11px;
  font-weight: 700;
  color: #111113;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

input, select {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  color: #111113;
  height: 38px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

input:focus, select:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.04);
}

.actions-right {
  display: flex;
  justify-content: flex-end;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-pill {
  flex: 1;
  min-width: 240px;
  border-radius: 980px !important;
  padding-left: 36px !important;
  background: rgba(255, 255, 255, 0.95) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2348484a' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") 14px center no-repeat !important;
  height: 38px !important;
}

.sport-filters {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 4px;
}

.filter-btn {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 700;
  color: #48484a;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Tweet Feed & Cards */
.tweet-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tweet-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.tweet-card:hover {
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 6px 24px rgba(0, 113, 227, 0.08);
  background: rgba(255, 255, 255, 0.96);
  transform: translateY(-1px);
}

.tweet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.tweet-author {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.author-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(0, 113, 227, 0.1);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(0, 113, 227, 0.15);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.tweet-title {
  color: #0071e3;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  letter-spacing: -0.2px;
  transition: color 0.15s ease;
}

.tweet-title:hover {
  text-decoration: underline;
}

.tweet-meta-tags {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.sport-badge {
  background: rgba(0, 113, 227, 0.1);
  border: 1px solid rgba(0, 113, 227, 0.2);
  color: #0071e3;
  padding: 2px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}

.date-tag {
  font-size: 12px;
  color: #48484a;
  font-weight: 500;
}

/* Status Badges */
.status-pill {
  padding: 4px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.2px;
  flex-shrink: 0;
}

.status-registration {
  background: rgba(255, 193, 7, 0.15);
  color: #856404;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-active {
  background: rgba(52, 199, 89, 0.15);
  color: #1b5e20;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.status-completed {
  background: rgba(142, 142, 147, 0.15);
  color: #48484a;
  border: 1px solid rgba(142, 142, 147, 0.3);
}

/* Tweet Content */
.tweet-content {
  font-size: 13px;
  color: #111113;
}

.tournament-stats-bar {
  font-size: 12px;
  color: #48484a;
  font-weight: 500;
}

/* Tweet Footer & Action Buttons */
.tweet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
  gap: 10px;
}

.tweet-actions-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.tweet-action-btn {
  background: rgba(0, 113, 227, 0.06);
  border: 1px solid rgba(0, 113, 227, 0.15);
  color: #0071e3;
  padding: 5px 12px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.tweet-action-btn:hover {
  background: rgba(0, 113, 227, 0.12);
  border-color: rgba(0, 113, 227, 0.3);
}

.btn-delete-tweet {
  background: rgba(255, 59, 48, 0.08);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #b71c1c;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 980px;
  transition: all 0.2s ease;
}

.btn-delete-tweet:hover {
  background: rgba(255, 59, 48, 0.15);
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
</style>
