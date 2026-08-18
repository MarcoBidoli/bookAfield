<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchTournamentById,
  generateTournamentSchedule,
  updateTournament,
} from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const tournamentId = route.params.id
const tournament = ref(null)
const isLoading = ref(true)
const isUpdating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const newTeamName = ref('')
const newPlayer = reactive({
  name: '',
  surname: '',
  jerseyNumber: '',
})
const selectedTeamIndex = ref(0)

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) return false
  const currentUserId = authStore.user._id || authStore.user.id
  return String(tournament.value.creatorId) === String(currentUserId)
})

const canAddTeams = computed(() => {
  if (!tournament.value) return false
  return (
    tournament.value.status === 'registration' &&
    (tournament.value.teams || []).length < tournament.value.maxTeams
  )
})

async function loadTournament() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    tournament.value = await fetchTournamentById(tournamentId)
  } catch (err) {
    errorMessage.value = err.message || 'Tournament not found'
  } finally {
    isLoading.value = false
  }
}

async function handleAddTeam() {
  if (!newTeamName.value.trim()) return

  const updatedTeams = [...(tournament.value.teams || [])]
  updatedTeams.push({
    name: newTeamName.value.trim(),
    players: [],
  })

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    tournament.value = await updateTournament(tournamentId, {
      teams: updatedTeams,
    })
    newTeamName.value = ''
    successMessage.value = 'Team registered successfully!'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to add team'
  } finally {
    isUpdating.value = false
  }
}

async function handleRemoveTeam(index) {
  const updatedTeams = [...(tournament.value.teams || [])]
  updatedTeams.splice(index, 1)

  isUpdating.value = true
  try {
    const updated = await updateTournament(tournamentId, {
      teams: updatedTeams,
    })
    tournament.value = updated
    successMessage.value = 'Team removed.'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to remove team'
  } finally {
    isUpdating.value = false
  }
}

async function handleAddPlayer() {
  if (!newPlayer.name.trim() || !newPlayer.surname.trim()) return

  const currentTeams = [...(tournament.value.teams || [])]
  if (!currentTeams[selectedTeamIndex.value]) return

  const team = currentTeams[selectedTeamIndex.value]
  const players = Array.isArray(team.players) ? [...team.players] : []

  players.push({
    userId: authStore.user?._id || authStore.user?.id,
    name: newPlayer.name.trim(),
    surname: newPlayer.surname.trim(),
    jerseyNumber: newPlayer.jerseyNumber ? String(newPlayer.jerseyNumber).trim() : null,
  })

  team.players = players

  isUpdating.value = true
  errorMessage.value = ''
  try {
    const updated = await updateTournament(tournamentId, {
      teams: currentTeams,
    })
    tournament.value = updated
    newPlayer.name = ''
    newPlayer.surname = ''
    newPlayer.jerseyNumber = ''
    successMessage.value = 'Player registered to team!'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to register player'
  } finally {
    isUpdating.value = false
  }
}

async function handleGenerateSchedule() {
  const confirmGen = window.confirm(
    'Generating match schedule will close team registrations and activate the tournament. Proceed?',
  )
  if (!confirmGen) return

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await generateTournamentSchedule(tournamentId)
    successMessage.value = 'Matches generated and tournament is now active!'
    await loadTournament()
    router.push(`/tournaments/${tournamentId}/matches`)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to generate schedule'
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  loadTournament()
})
</script>

<template>
  <div class="tournament-detail-view">
    <!-- Breadcrumbs -->
    <Breadcrumbs section="Tournaments" section-to="/tournaments" :current="tournament?.name" />

    <!-- Status Banners -->
    <div v-if="successMessage" class="banner success-banner">
      <span class="banner-icon">✓</span> {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="banner error-banner">
      <span class="banner-icon">⚠️</span> {{ errorMessage }}
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading tournament dashboard...</span>
    </div>

    <template v-else-if="tournament">
      <!-- Tournament Hero Dashboard Card -->
      <div class="tournament-hero-card">
        <div class="hero-top-row">
          <div class="hero-sport-badge">
            {{ tournament.sport === 'football' ? '⚽' : tournament.sport === 'basketball' ? '🏀' : '🏐' }}
            <span class="sport-text">{{ tournament.sport }}</span>
          </div>
          <span :class="['status-pill', `status-${tournament.status}`]">
            {{ tournament.status }}
          </span>
        </div>

        <div class="hero-main-info">
          <h1 class="hero-title">{{ tournament.name }}</h1>
          <div class="hero-meta-grid">
            <div class="meta-card">
              <span class="meta-label">Start Date</span>
              <span class="meta-value">📅 {{ tournament.startDate }}</span>
            </div>
            <div class="meta-card">
              <span class="meta-label">Teams Capacity</span>
              <span class="meta-value">
                👥 {{ tournament.teams ? tournament.teams.length : 0 }} / {{ tournament.maxTeams }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Navigation & Management Actions -->
        <div class="hero-actions-bar">
          <div class="nav-actions">
            <router-link :to="`/tournaments/${tournament._id}/matches`">
              <AquaButton class="action-btn primary-action">Match Schedule</AquaButton>
            </router-link>
            <router-link :to="`/tournaments/${tournament._id}/standings`">
              <AquaButton class="action-btn secondary-action">Standings</AquaButton>
            </router-link>
          </div>

          <div class="owner-actions" v-if="isOwner">
            <router-link
              v-if="tournament.status === 'registration'"
              :to="`/tournaments/${tournament._id}/edit`"
            >
              <AquaButton class="action-btn outline-action">Edit Tournament</AquaButton>
            </router-link>
            <AquaButton
              v-if="tournament.status === 'registration' && tournament.teams?.length === tournament.maxTeams"
              :disabled="isUpdating"
              @click="handleGenerateSchedule"
              class="action-btn start-cup-btn"
            >
              Generate Matches & Start Cup 🚀
            </AquaButton>
          </div>
        </div>
      </div>

      <!-- Manage Teams & Rosters Section -->
      <div class="management-section">
        <div class="section-header-bar">
          <div class="header-titles">
            <h2>Registered Teams & Rosters</h2>
            <p>Manage team participants and roster line-ups</p>
          </div>
          <span class="team-count-badge">
            {{ tournament.teams ? tournament.teams.length : 0 }} Teams
          </span>
        </div>

        <!-- Add Team Form (Owner & Registration) -->
        <div v-if="isOwner && canAddTeams" class="action-form-card">
          <div class="form-card-header">
            <span class="form-icon">🛡️</span>
            <div>
              <h3>Add New Team</h3>
              <p>Register a participating team into the tournament</p>
            </div>
          </div>
          <form @submit.prevent="handleAddTeam" class="action-form-inline">
            <input
              v-model="newTeamName"
              type="text"
              placeholder="Team Name (e.g. FC Barcelona)"
              required
              class="form-input flex-2"
            />
            <AquaButton type="submit" :disabled="isUpdating || !newTeamName.trim()">
              Register Team
            </AquaButton>
          </form>
        </div>

        <!-- Add Player Form (Owner, Registration & Teams Exist) -->
        <div
          v-if="isOwner && tournament.status === 'registration' && tournament.teams?.length > 0"
          class="action-form-card"
        >
          <div class="form-card-header">
            <span class="form-icon">👤</span>
            <div>
              <h3>Assign Player</h3>
              <p>Add player details to any registered team roster</p>
            </div>
          </div>
          <form @submit.prevent="handleAddPlayer" class="action-form-grid">
            <select v-model="selectedTeamIndex" class="form-select">
              <option v-for="(team, idx) in tournament.teams" :key="idx" :value="idx">
                {{ team.name }}
              </option>
            </select>

            <input
              v-model="newPlayer.name"
              type="text"
              placeholder="First Name"
              required
              class="form-input"
            />
            <input
              v-model="newPlayer.surname"
              type="text"
              placeholder="Surname"
              required
              class="form-input"
            />
            <input
              v-model="newPlayer.jerseyNumber"
              type="text"
              placeholder="Jersey #"
              class="form-input jersey-input"
            />

            <AquaButton type="submit" :disabled="isUpdating" class="add-player-btn">
              Add Player
            </AquaButton>
          </form>
        </div>

        <!-- Teams Empty State -->
        <div v-if="!tournament.teams || tournament.teams.length === 0" class="empty-state">
          <div class="empty-icon">🛡️</div>
          <h3>No Teams Registered Yet</h3>
          <p>Register teams to begin building the tournament rosters.</p>
        </div>

        <!-- Teams Grid -->
        <div v-else class="teams-grid">
          <div v-for="(team, idx) in tournament.teams" :key="team._id || idx" class="team-card">
            <div class="team-card-header">
              <div class="team-title-group">
                <span class="team-index">#{{ idx + 1 }}</span>
                <h4 class="team-name">{{ team.name }}</h4>
              </div>
              <button
                v-if="isOwner && tournament.status === 'registration'"
                type="button"
                class="remove-team-btn"
                @click="handleRemoveTeam(idx)"
                title="Remove team"
              >
                ✕ Remove
              </button>
            </div>

            <!-- Roster Section -->
            <div class="team-roster-box">
              <div class="roster-header">
                <span class="roster-title">Squad Roster</span>
                <span class="roster-count">{{ team.players?.length || 0 }} players</span>
              </div>

              <ul v-if="team.players && team.players.length > 0" class="player-list">
                <li v-for="(p, pIdx) in team.players" :key="pIdx" class="player-item">
                  <span class="player-name">👤 {{ p.name }} {{ p.surname }}</span>
                  <span v-if="p.jerseyNumber" class="jersey-badge">#{{ p.jerseyNumber }}</span>
                </li>
              </ul>
              <div v-else class="no-players">No players assigned to this roster yet</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tournament-detail-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
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

/* Tournament Hero Card */
.tournament-hero-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-sport-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.2);
  padding: 4px 12px;
  border-radius: 980px;
  font-size: 13px;
  font-weight: 700;
  color: #0071e3;
  text-transform: capitalize;
}

.hero-main-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-title {
  font-size: 24px;
  font-weight: 800;
  color: #111113;
  margin: 0;
  letter-spacing: -0.5px;
}

.hero-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.meta-card {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 10px;
  font-weight: 700;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 14px;
  font-weight: 700;
  color: #111113;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 980px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.2px;
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

/* Actions Bar */
.hero-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
  gap: 12px;
}

.nav-actions,
.owner-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.start-cup-btn {
  background: linear-gradient(135deg, #0071e3 0%, #409cff 100%) !important;
  color: #fff !important;
  font-weight: 700 !important;
}

/* Management Section */
.management-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.header-titles h2 {
  font-size: 18px;
  font-weight: 700;
  color: #111113;
  margin: 0;
  letter-spacing: -0.3px;
}

.header-titles p {
  font-size: 12px;
  color: #8e8e93;
  margin: 2px 0 0 0;
  font-weight: 500;
}

.team-count-badge {
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 12px;
  border-radius: 980px;
  font-size: 12px;
  font-weight: 700;
  color: #48484a;
}

/* Action Forms */
.action-form-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  background: rgba(0, 113, 227, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-card-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: #111113;
  margin: 0;
}

.form-card-header p {
  font-size: 11px;
  color: #8e8e93;
  margin: 2px 0 0 0;
  font-weight: 500;
}

.action-form-inline,
.action-form-grid {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.action-form-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 90px auto;
}

@media (max-width: 768px) {
  .action-form-grid {
    grid-template-columns: 1fr;
  }
}

.form-input,
.form-select {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  color: #111113;
  height: 40px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  width: 100%;
}

.form-input:focus,
.form-select:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.04);
}

.flex-2 {
  flex: 2;
  min-width: 220px;
}

.jersey-input {
  max-width: 100px;
}

/* Teams Grid */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.team-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.team-card:hover {
  border-color: rgba(0, 113, 227, 0.3);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 6px 24px rgba(0, 113, 227, 0.08);
  transform: translateY(-1px);
}

.team-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 12px;
}

.team-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-index {
  font-size: 11px;
  font-weight: 700;
  color: #8e8e93;
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 8px;
  border-radius: 980px;
}

.team-name {
  font-size: 15px;
  font-weight: 700;
  color: #0071e3;
  margin: 0;
  letter-spacing: -0.2px;
}

.remove-team-btn {
  background: rgba(255, 59, 48, 0.08);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #b71c1c;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 980px;
  transition: all 0.2s ease;
}

.remove-team-btn:hover {
  background: rgba(255, 59, 48, 0.15);
}

/* Roster Box */
.team-roster-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.roster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.roster-title {
  font-size: 11px;
  font-weight: 700;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.roster-count {
  font-size: 11px;
  font-weight: 600;
  color: #48484a;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
}

.player-name {
  font-weight: 600;
  color: #111113;
}

.jersey-badge {
  font-size: 11px;
  color: #0071e3;
  font-weight: 700;
  background: rgba(0, 113, 227, 0.1);
  border: 1px solid rgba(0, 113, 227, 0.2);
  padding: 1px 8px;
  border-radius: 980px;
}

.no-players {
  color: #8e8e93;
  font-style: italic;
  font-size: 12px;
  padding: 8px 0;
  text-align: center;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  border: 1px dashed rgba(0, 0, 0, 0.06);
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
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
  width: 28px;
  height: 28px;
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
