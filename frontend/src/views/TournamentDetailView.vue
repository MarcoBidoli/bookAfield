<!-- TODO: huge view - split in components -->
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchTournamentById,
  generateTournamentSchedule,
  updateTournament,
} from '@/api/tournaments'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import AppBanner from '@/components/AppBanner.vue'

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
const selectedTeamIndex = ref(0)

const newPlayer = reactive({
  name: '',
  surname: '',
  jerseyNumber: '',
})

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) {
    return false
  }

  const currentUserId = authStore.user._id || authStore.user.id

  return String(tournament.value.creatorId) === String(currentUserId)
})

const teams = computed(() => {
  return Array.isArray(tournament.value?.teams)
    ? tournament.value.teams
    : []
})

const numberOfTeams = computed(() => teams.value.length)

const numberOfPlayers = computed(() => {
  return teams.value.reduce((total, team) => {
    return total + (Array.isArray(team.players) ? team.players.length : 0)
  }, 0)
})

const canAddTeams = computed(() => {
  return (
    isOwner.value &&
    tournament.value?.status === 'registration' &&
    numberOfTeams.value < tournament.value.maxTeams
  )
})

const canManagePlayers = computed(() => {
  return (
    isOwner.value &&
    tournament.value?.status === 'registration' &&
    numberOfTeams.value > 0
  )
})

const canStartTournament = computed(() => {
  return (
    isOwner.value &&
    tournament.value?.status === 'registration' &&
    numberOfTeams.value === tournament.value.maxTeams
  )
})

const statusLabel = computed(() => {
  const status = tournament.value?.status

  if (status === 'registration') return 'Registration Open'
  if (status === 'active') return 'Active'
  if (status === 'completed') return 'Completed'

  return status || ''
})

const sportLabel = computed(() => {
  const sport = tournament.value?.sport

  if (!sport) return ''

  return sport.charAt(0).toUpperCase() + sport.slice(1)
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
  const teamName = newTeamName.value.trim()

  if (!teamName) {
    return
  }

  if (!canAddTeams.value) {
    return
  }

  const updatedTeams = [...teams.value]

  updatedTeams.push({
    name: teamName,
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

    successMessage.value = 'Team registered successfully.'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to add team'
  } finally {
    isUpdating.value = false
  }
}

async function handleRemoveTeam(index) {
  if (!isOwner.value || tournament.value?.status !== 'registration') {
    return
  }

  const team = teams.value[index]

  if (!team) {
    return
  }

  const confirmed = window.confirm(
    `Remove "${team.name}" from this tournament?`,
  )

  if (!confirmed) {
    return
  }

  const updatedTeams = [...teams.value]
  updatedTeams.splice(index, 1)

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    tournament.value = await updateTournament(tournamentId, {
      teams: updatedTeams,
    })

    if (selectedTeamIndex.value >= updatedTeams.length) {
      selectedTeamIndex.value = Math.max(0, updatedTeams.length - 1)
    }

    successMessage.value = 'Team removed successfully.'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to remove team'
  } finally {
    isUpdating.value = false
  }
}

async function handleAddPlayer() {
  if (!canManagePlayers.value) {
    return
  }

  if (!newPlayer.name.trim() || !newPlayer.surname.trim()) {
    return
  }

  const currentTeams = teams.value.map(team => ({
    ...team,
    players: Array.isArray(team.players) ? [...team.players] : [],
  }))

  const team = currentTeams[selectedTeamIndex.value]

  if (!team) {
    return
  }

  team.players.push({
    userId: authStore.user?._id || authStore.user?.id || null,
    name: newPlayer.name.trim(),
    surname: newPlayer.surname.trim(),
    jerseyNumber: newPlayer.jerseyNumber
      ? String(newPlayer.jerseyNumber).trim()
      : null,
  })

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    tournament.value = await updateTournament(tournamentId, {
      teams: currentTeams,
    })

    newPlayer.name = ''
    newPlayer.surname = ''
    newPlayer.jerseyNumber = ''

    successMessage.value = `Player added to ${team.name}.`
  } catch (err) {
    errorMessage.value = err.message || 'Failed to register player'
  } finally {
    isUpdating.value = false
  }
}

async function handleGenerateSchedule() {
  const confirmed = window.confirm(
    'Generating the match schedule will close team registration and activate the tournament. Continue?',
  )

  if (!confirmed) {
    return
  }

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await generateTournamentSchedule(tournamentId)

    await loadTournament()

    router.push(`/tournaments/${tournamentId}/matches`)
  } catch (err) {
    errorMessage.value =
      err.message || 'Failed to generate tournament schedule'
  } finally {
    isUpdating.value = false
  }
}

function goToEdit() {
  router.push(`/tournaments/${tournamentId}/edit`)
}

function goToMatches() {
  router.push(`/tournaments/${tournamentId}/matches`)
}

function goToStandings() {
  router.push(`/tournaments/${tournamentId}/standings`)
}

onMounted(() => {
  loadTournament()
})
</script>

<template>
  <div class="tournament-view">
    <!-- Breadcrumbs -->
    <Breadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :current="tournament?.name || 'Tournament'"
    />

    <!-- Header -->
    <PageHeader
      v-if="!isLoading && tournament"
      :title="tournament.name"
    />

    <!-- Feedback -->
    <AppBanner
      v-if="errorMessage"
      type="error"
      :message="errorMessage"
    />

    <AppBanner
      v-if="successMessage"
      type="success"
      :message="successMessage"
    />

    <!-- Loading -->
    <LoadingState
      v-if="isLoading"
      message="Loading tournament..."
    />

    <!-- Tournament -->
    <template v-else-if="tournament">
      <!-- Overview -->
      <Panel class="overview-panel">
        <div class="overview-header">
          <div class="sport-badge">
            <!-- Volleyball icon -->
            <svg
              v-if="tournament.sport === 'volleyball'"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M7 5.5c2.8 1.2 4.7 3.2 5.6 5.8M16.8 5.7c-2.5 1.8-3.9 4-4.2 6.7M5 15.4c3 .2 5.4-.6 7.3-2.6M19 14.7c-2.3-.4-4.4.2-6.2 1.9"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>

            <!-- Football icon -->
            <svg
              v-else-if="tournament.sport === 'football'"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 3.5l4.8 3.5-1.8 5.7h-6L7.2 7z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="M12 3.5v5M7.2 7l4.8 1.5M16.8 7L12 8.5M9 12.7l-3.7 3M15 12.7l3.7 3M9 12.7l-1.5 5.2M15 12.7l1.5 5.2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>

            <!-- Basketball icon -->
            <svg
              v-else
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M5.5 7.2c3.2.8 5.8 2.8 7.3 5.8M18.5 7.2c-3.2.8-5.8 2.8-7.3 5.8M5 15.8c2.5-.4 4.8-1.6 6.5-3.8M19 15.8c-2.5-.4-4.8-1.6-6.5-3.8"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>

            <span>{{ sportLabel }}</span>
          </div>

          <span
            :class="[
              'status-badge',
              `status-${tournament.status}`,
            ]"
          >
            <span class="status-dot"></span>
            {{ statusLabel }}
          </span>
        </div>

        <div class="overview-stats">
          <!-- Date -->
          <div class="stat">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="15"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                />
                <path
                  d="M8 3.5v3M16 3.5v3M4 9h16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <div>
              <span class="stat-label">Start Date</span>
              <strong>{{ tournament.startDate }}</strong>
            </div>
          </div>

          <!-- Teams -->
          <div class="stat">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="9"
                  cy="8"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                />
                <circle
                  cx="16.5"
                  cy="9"
                  r="2.3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M3.8 19c.5-3 2.2-5 5.2-5s4.7 2 5.2 5M14.5 14.5c2.7-.2 4.7 1.3 5.3 4.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <div>
              <span class="stat-label">Teams</span>
              <strong>
                {{ numberOfTeams }}
                <span class="stat-muted">
                  / {{ tournament.maxTeams }}
                </span>
              </strong>
            </div>
          </div>

          <!-- Players -->
          <div class="stat">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="8"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                />
                <path
                  d="M5.5 20c.6-4.1 2.7-6.2 6.5-6.2s5.9 2.1 6.5 6.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <div>
              <span class="stat-label">Players</span>
              <strong>{{ numberOfPlayers }}</strong>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="overview-actions">
          <Button
            variant="secondary"
            class="navigation-button"
            @click="goToMatches"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="4"
                y="5"
                width="16"
                height="14"
                rx="2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              />
              <path
                d="M8 9h8M8 13h5M8 17h3"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
            </svg>
            Matches
          </Button>

          <Button
            variant="secondary"
            class="navigation-button"
            @click="goToStandings"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 19V10M12 19V5M19 19v-7"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            Standings
          </Button>

          <div class="overview-spacer"></div>

          <Button
            v-if="isOwner && tournament.status === 'registration'"
            variant="secondary"
            class="navigation-button"
            @click="goToEdit"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14.5 5.5l4 4M5 19l3.5-.8L18.5 8.2a2.1 2.1 0 000-3l-.7-.7a2.1 2.1 0 00-3 0L4.8 14.5z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
            </svg>
            Edit
          </Button>

          <Button
            v-if="canStartTournament"
            variant="primary"
            class="start-button"
            :disabled="isUpdating"
            @click="handleGenerateSchedule"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M13 2L5 13h6l-1 9 8-11h-6z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
            {{ isUpdating ? 'Starting...' : 'Start Tournament' }}
          </Button>
        </div>
      </Panel>

      <!-- Registration -->
      <template v-if="tournament.status === 'registration'">
        <div class="section-heading">
          <div>
            <h2>Teams</h2>
            <p>Manage the teams and player rosters registered for this tournament.</p>
          </div>

          <div class="capacity-badge">
            {{ numberOfTeams }} / {{ tournament.maxTeams }}
          </div>
        </div>

        <!-- Add Team -->
        <Panel
          v-if="canAddTeams"
          class="management-panel"
        >
          <div class="panel-heading">
            <div class="heading-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5v14M5 12h14"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <div>
              <h3>Add Team</h3>
              <p>
                {{ tournament.maxTeams - numberOfTeams }}
                team{{ tournament.maxTeams - numberOfTeams === 1 ? '' : 's' }}
                remaining
              </p>
            </div>
          </div>

          <form
            class="team-form"
            @submit.prevent="handleAddTeam"
          >
            <input
              v-model="newTeamName"
              class="form-input"
              type="text"
              placeholder="Enter team name"
              :disabled="isUpdating"
            />

            <Button
              type="submit"
              variant="primary"
              :disabled="isUpdating || !newTeamName.trim()"
            >
              Add Team
            </Button>
          </form>
        </Panel>

        <!-- Add Player -->
        <Panel
          v-if="canManagePlayers"
          class="management-panel"
        >
          <div class="panel-heading">
            <div class="heading-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="8"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                />
                <path
                  d="M6 20c.6-3.7 2.6-5.5 6-5.5s5.4 1.8 6 5.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <div>
              <h3>Add Player</h3>
              <p>Add a player to one of the registered teams.</p>
            </div>
          </div>

          <form
            class="player-form"
            @submit.prevent="handleAddPlayer"
          >
            <select
              v-model.number="selectedTeamIndex"
              class="form-input"
              :disabled="isUpdating"
            >
              <option
                v-for="(team, index) in teams"
                :key="team._id || index"
                :value="index"
              >
                {{ team.name }}
              </option>
            </select>

            <input
              v-model="newPlayer.name"
              class="form-input"
              type="text"
              placeholder="First name"
              :disabled="isUpdating"
            />

            <input
              v-model="newPlayer.surname"
              class="form-input"
              type="text"
              placeholder="Surname"
              :disabled="isUpdating"
            />

            <input
              v-model="newPlayer.jerseyNumber"
              class="form-input jersey-input"
              type="text"
              placeholder="Number"
              :disabled="isUpdating"
            />

            <Button
              type="submit"
              variant="secondary"
              :disabled="
                isUpdating ||
                !newPlayer.name.trim() ||
                !newPlayer.surname.trim()
              "
            >
              Add Player
            </Button>
          </form>
        </Panel>
      </template>

      <!-- Teams -->
      <div
        v-if="teams.length > 0"
        class="teams-grid"
      >
        <Panel
          v-for="(team, index) in teams"
          :key="team._id || index"
          class="team-card"
        >
          <div class="team-header">
            <!--
            <div class="team-number">
              {{ String(index + 1).padStart(2, '0') }}
            </div>
            -->

            <div class="team-title">
              <h3>{{ team.name }}</h3>
              <span>
                {{ team.players?.length || 0 }}
                {{ team.players?.length === 1 ? 'player' : 'players' }}
              </span>
            </div>

            <button
              v-if="isOwner && tournament.status === 'registration'"
              type="button"
              class="remove-button"
              :disabled="isUpdating"
              title="Remove team"
              @click="handleRemoveTeam(index)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 14h8l1-14"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div class="roster">
            <div class="roster-header">
              <span>Roster</span>

              <span class="roster-count">
                {{ team.players?.length || 0 }}
              </span>
            </div>

            <div
              v-if="team.players?.length"
              class="player-list"
            >
              <div
                v-for="(player, playerIndex) in team.players"
                :key="player.userId || playerIndex"
                class="player-row"
              >

                <div class="player-avatar">
                  {{ player.name?.charAt(0) }}{{ player.surname?.charAt(0) }}
                </div>

                <div class="player-info">
                  <strong>
                    {{ player.name }} {{ player.surname }}
                  </strong>
                </div>

                <span
                  v-if="player.jerseyNumber"
                  class="jersey"
                >
                  #{{ player.jerseyNumber }}
                </span>
              </div>
            </div>

            <div
              v-else
              class="empty-roster"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="8"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="M6 20c.6-3.7 2.6-5.5 6-5.5s5.4 1.8 6 5.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>

              <span>No players registered</span>
            </div>
          </div>
        </Panel>
      </div>

      <!-- Empty teams -->
      <EmptyState
        v-else
        title="No Teams Registered"
        message="Add teams to start building the tournament."
      />
    </template>
  </div>
</template>

<style scoped>
.tournament-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                   */
/* -------------------------------------------------------------------------- */

.overview-panel {
  padding: 28px;
  border-radius: 18px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.sport-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 12px;
  border-radius: 999px;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.15);
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.sport-badge svg {
  width: 18px;
  height: 18px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-registration {
  color: #856404;
  background: rgba(255, 193, 7, 0.12);
  border: 1px solid rgba(255, 193, 7, 0.25);
}

.status-registration .status-dot {
  background: #d99f00;
}

.status-active {
  color: #1b5e20;
  background: rgba(52, 199, 89, 0.12);
  border: 1px solid rgba(52, 199, 89, 0.25);
}

.status-active .status-dot {
  background: #34c759;
}

.status-completed {
  color: #48484a;
  background: rgba(142, 142, 147, 0.12);
  border: 1px solid rgba(142, 142, 147, 0.2);
}

.status-completed .status-dot {
  background: #8e8e93;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 24px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.025);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.stat-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat strong {
  font-size: 14px;
  color: #111113;
}

.stat-muted {
  color: #8e8e93;
  font-weight: 600;
}

.overview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  flex-wrap: wrap;
}

.overview-spacer {
  flex: 1;
}

.navigation-button,
.start-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.navigation-button svg,
.start-button svg {
  width: 16px;
  height: 16px;
}

/* -------------------------------------------------------------------------- */
/* Section heading                                                            */
/* -------------------------------------------------------------------------- */

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 0 4px;
}

.section-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 750;
  color: #111113;
  letter-spacing: -0.3px;
}

.section-heading p {
  margin: 5px 0 0;
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
}

.capacity-badge {
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
  color: #48484a;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

/* -------------------------------------------------------------------------- */
/* Management panels                                                          */
/* -------------------------------------------------------------------------- */

.management-panel {
  padding: 22px 24px;
  border-radius: 16px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.heading-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
}

.heading-icon svg {
  width: 19px;
  height: 19px;
}

.panel-heading h3 {
  margin: 0;
  color: #111113;
  font-size: 14px;
  font-weight: 700;
}

.panel-heading p {
  margin: 3px 0 0;
  color: #8e8e93;
  font-size: 11px;
}

/* -------------------------------------------------------------------------- */
/* Forms                                                                      */
/* -------------------------------------------------------------------------- */

.team-form {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-form {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 100px auto;
  gap: 10px;
  align-items: center;
}

.form-input {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 9px;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  color: #111113;
  font-size: 12px;
  font-weight: 600;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}

.form-input:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.team-form .form-input {
  flex: 1;
}

/* -------------------------------------------------------------------------- */
/* Teams                                                                      */
/* -------------------------------------------------------------------------- */

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 18px;
}

.team-card {
  padding: 22px;
  border-radius: 16px;
}

.team-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.team-number {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
  font-size: 11px;
  font-weight: 800;
}

.team-title {
  min-width: 0;
  flex: 1;
}

.team-title h3 {
  margin: 0;
  color: #111113;
  font-size: 15px;
  font-weight: 750;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-title span {
  display: block;
  margin-top: 3px;
  color: #8e8e93;
  font-size: 11px;
  font-weight: 500;
}

.remove-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  color: #b71c1c;
  background: rgba(255, 59, 48, 0.08);
  cursor: pointer;
}

.remove-button:hover {
  background: rgba(255, 59, 48, 0.14);
}

.remove-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-button svg {
  width: 17px;
  height: 17px;
}

.roster {
  margin-top: 18px;
}

.roster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.roster-header > span:first-child {
  font-size: 10px;
  font-weight: 750;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.roster-count {
  min-width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 7px;
  border-radius: 999px;
  color: #48484a;
  background: rgba(0, 0, 0, 0.05);
  font-size: 10px;
  font-weight: 700;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.018);
}

.player-avatar {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.player-info strong {
  color: #111113;
  font-size: 12px;
  font-weight: 650;
}

.player-info span {
  color: #8e8e93;
  font-size: 9px;
  font-weight: 500;
}

.jersey {
  padding: 4px 8px;
  border-radius: 999px;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
  font-size: 10px;
  font-weight: 750;
}

.empty-roster {
  min-height: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  color: #8e8e93;
  background: rgba(0, 0, 0, 0.015);
  font-size: 11px;
}

.empty-roster svg {
  width: 22px;
  height: 22px;
}

/* -------------------------------------------------------------------------- */
/* Registration footer                                                        */
/* -------------------------------------------------------------------------- */

.registration-footer {
  padding: 20px 22px;
  border-radius: 14px;
}

.registration-progress {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.ready-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: 9px;
  color: #1b5e20;
  background: rgba(52, 199, 89, 0.09);
  border: 1px solid rgba(52, 199, 89, 0.18);
  font-size: 11px;
  font-weight: 600;
}

.ready-message svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

/* -------------------------------------------------------------------------- */
/* Responsive                                                                 */
/* -------------------------------------------------------------------------- */

@media (max-width: 800px) {
  .overview-stats {
    grid-template-columns: 1fr;
  }

  .player-form {
    grid-template-columns: 1fr 1fr;
  }

  .player-form .form-input:first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .overview-panel {
    padding: 20px;
  }

  .overview-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .overview-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .overview-spacer {
    display: none;
  }

  .navigation-button,
  .start-button {
    justify-content: center;
    width: 100%;
  }

  .team-form {
    align-items: stretch;
    flex-direction: column;
  }

  .team-form .form-input {
    width: 100%;
  }

  .team-form button {
    width: 100%;
  }

  .player-form {
    grid-template-columns: 1fr;
  }

  .player-form .form-input:first-child {
    grid-column: auto;
  }

  .player-form button {
    width: 100%;
  }

  .section-heading {
    align-items: flex-start;
  }

  .teams-grid {
    grid-template-columns: 1fr;
  }
}
</style>
