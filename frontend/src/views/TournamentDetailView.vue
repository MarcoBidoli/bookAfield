<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchTournamentById,
  updateTournament,
  generateTournamentSchedule
} from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'

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
  jerseyNumber: ''
})
const selectedTeamIndex = ref(0)

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) return false
  const currentUserId = authStore.user._id || authStore.user.id
  return String(tournament.value.creatorId) === String(currentUserId)
})

const canAddTeams = computed(() => {
  if (!tournament.value) return false
  return tournament.value.status === 'registration' &&
    (tournament.value.teams || []).length < tournament.value.maxTeams
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
    players: []
  })

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updated = await updateTournament(tournamentId, {
      teams: updatedTeams
    })
    tournament.value = updated
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
      teams: updatedTeams
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
    jerseyNumber: newPlayer.jerseyNumber ? String(newPlayer.jerseyNumber).trim() : null
  })

  team.players = players

  isUpdating.value = true
  errorMessage.value = ''
  try {
    const updated = await updateTournament(tournamentId, {
      teams: currentTeams
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
    'Generating match schedule will close team registrations and activate the tournament. Proceed?'
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
    <!-- Status Banners -->
    <div v-if="successMessage" class="banner success-banner">
      ✓ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="banner error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <div v-if="isLoading" class="loading-box">
      Loading tournament details...
    </div>

    <template v-else-if="tournament">
      <!-- Tournament Header Panel -->
      <AquaPanel :title="`Tournament: ${tournament.name}`">
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Sport</span>
            <span class="summary-val text-capitalize">{{ tournament.sport }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Status</span>
            <span :class="['status-pill', `status-${tournament.status}`]">
              {{ tournament.status }}
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Start Date</span>
            <span class="summary-val">{{ tournament.startDate }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Teams Capacity</span>
            <span class="summary-val">
              {{ tournament.teams ? tournament.teams.length : 0 }} / {{ tournament.maxTeams }}
            </span>
          </div>
        </div>

        <div class="nav-links-row">
          <router-link :to="`/tournaments/${tournament._id}/matches`">
            <AquaButton>View Match Schedule</AquaButton>
          </router-link>
          <router-link :to="`/tournaments/${tournament._id}/standings`" style="margin-left: 10px;">
            <AquaButton>View Standings</AquaButton>
          </router-link>
          <AquaButton
            v-if="isOwner && tournament.status === 'registration' && tournament.teams?.length === tournament.maxTeams"
            style="margin-left: 10px;"
            :disabled="isUpdating"
            @click="handleGenerateSchedule"
          >
            Generate Matches & Start Cup
          </AquaButton>
        </div>
      </AquaPanel>

      <!-- Manage Teams & Rosters (Registration Mode) -->
      <AquaPanel title="Registered Teams & Rosters">
        <!-- Add Team Form (If Owner & In Registration) -->
        <div v-if="isOwner && canAddTeams" class="add-team-box">
          <label class="form-title">Register Team:</label>
          <form @submit.prevent="handleAddTeam" class="inline-form">
            <input
              v-model="newTeamName"
              type="text"
              placeholder="Team Name (e.g. FC Barcelona)"
              required
              style="flex: 2;"
            />
            <AquaButton type="submit" :disabled="isUpdating || !newTeamName.trim()">
              Add Team
            </AquaButton>
          </form>
        </div>

        <div v-if="!tournament.teams || tournament.teams.length === 0" class="empty-hint">
          No teams registered yet.
        </div>

        <!-- Teams Grid -->
        <div v-else class="teams-container">
          <div
            v-for="(team, idx) in tournament.teams"
            :key="team._id || idx"
            class="team-card"
          >
            <div class="team-header">
              <span class="team-name">{{ idx + 1 }}. {{ team.name }}</span>
              <button
                v-if="isOwner && tournament.status === 'registration'"
                type="button"
                class="remove-team-btn"
                @click="handleRemoveTeam(idx)"
              >
                Remove
              </button>
            </div>

            <!-- Player list for this team -->
            <div class="roster-section">
              <span class="roster-label">Players / Roster:</span>
              <ul v-if="team.players && team.players.length > 0" class="player-list">
                <li v-for="(p, pIdx) in team.players" :key="pIdx">
                  {{ p.name }} {{ p.surname }}
                  <span v-if="p.jerseyNumber" class="jersey">#{{ p.jerseyNumber }}</span>
                </li>
              </ul>
              <div v-else class="no-players">No players assigned</div>
            </div>
          </div>
        </div>

        <!-- Add Player Form (If in registration) -->
        <div v-if="isOwner && tournament.status === 'registration' && tournament.teams?.length > 0" class="add-player-box">
          <label class="form-title">Add Player to Team Roster:</label>
          <form @submit.prevent="handleAddPlayer" class="player-form">
            <select v-model="selectedTeamIndex" style="flex: 1;">
              <option
                v-for="(team, idx) in tournament.teams"
                :key="idx"
                :value="idx"
              >
                {{ team.name }}
              </option>
            </select>

            <input
              v-model="newPlayer.name"
              type="text"
              placeholder="First Name"
              required
              style="flex: 1;"
            />
            <input
              v-model="newPlayer.surname"
              type="text"
              placeholder="Surname"
              required
              style="flex: 1;"
            />
            <input
              v-model="newPlayer.jerseyNumber"
              type="text"
              placeholder="Jersey #"
              style="width: 80px;"
            />

            <AquaButton type="submit" :disabled="isUpdating">
              Add Player
            </AquaButton>
          </form>
        </div>
      </AquaPanel>
    </template>
  </div>
</template>

<style scoped>
.tournament-detail-view {
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #ddd;
  padding: 12px 16px;
  border-radius: 5px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: 10px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
}

.summary-val {
  font-size: 13px;
  font-weight: bold;
  color: #222;
}

.text-capitalize {
  text-transform: capitalize;
}

.status-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
  text-transform: capitalize;
  width: fit-content;
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

.nav-links-row {
  display: flex;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.form-title {
  display: block;
  font-size: 11px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.add-team-box, .add-player-box {
  background: #fff;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 14px;
}

.inline-form, .player-form {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
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

.teams-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.team-card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
  margin-bottom: 6px;
}

.team-name {
  font-weight: bold;
  color: #0044bb;
  font-size: 12px;
}

.remove-team-btn {
  background: none;
  border: none;
  color: #c02020;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
}

.remove-team-btn:hover {
  text-decoration: underline;
}

.roster-section {
  font-size: 11px;
}

.roster-label {
  color: #777;
  display: block;
  margin-bottom: 4px;
}

.player-list {
  list-style: square;
  padding-left: 18px;
  color: #333;
}

.jersey {
  font-size: 10px;
  color: #666;
  font-weight: bold;
}

.no-players {
  color: #999;
  font-style: italic;
}

.loading-box, .empty-hint {
  font-size: 12px;
  color: #666;
  padding: 16px;
  text-align: center;
}
</style>
