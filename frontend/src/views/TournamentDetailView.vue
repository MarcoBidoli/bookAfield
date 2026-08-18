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
import SportBadge from '@/components/SportBadge.vue'
import UserIcon from '@/components/icons/UserIcon.vue'
import UsersIcon from '@/components/icons/UsersIcon.vue'
import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import MatchesIcon from '@/components/icons/MatchesIcon.vue'
import StandingsIcon from '@/components/icons/StandingsIcon.vue'
import TeamCard from '@/components/TeamCard.vue'
import PencilIcon from '@/components/icons/PencilIcon.vue'
import AddIcon from '@/components/icons/AddIcon.vue'

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
const selectedTeamId = ref(null);

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

const isRegistrationOpen = computed(() => {
  return tournament.value?.status === 'registration'
})

const canManageTournament = computed(() => {
  return isOwner.value && isRegistrationOpen.value
})

const canAddTeams = computed(() => {
  return (
    canManageTournament.value &&
    numberOfTeams.value < tournament.value.maxTeams
  )
})

const canManagePlayers = computed(() => {
  return canManageTournament.value && numberOfTeams.value > 0
})

const canStartTournament = computed(() => {
  return (
    canManageTournament.value &&
    numberOfTeams.value === tournament.value.maxTeams
  )
})

const selectedTeam = computed(() => {
  return teams.value.find(
    (team) => String(team._id) === String(selectedTeamId.value),
  )
})

async function loadTournament() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    tournament.value = await fetchTournamentById(tournamentId)
    if(!selectedTeam.value && teams.value.length) {
      selectedTeamId.value = teams.value[0]._id
    }
  } catch (err) {
    errorMessage.value = err.message || 'Tournament not found'
  } finally {
    isLoading.value = false
  }
}

async function handleAddTeam() {
  const teamName = newTeamName.value.trim()

  if (!teamName || !canAddTeams.value) {
    return
  }

  const updatedTeams = [
    ...teams.value,
    {
      name: teamName,
      players: [],
    },
  ]

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

async function handleRemoveTeam(team) {
  if (!canManageTournament.value || !team) {
    return
  }

  const confirmed = window.confirm(
    `Remove "${team.name}" from this tournament?`,
  )

  if (!confirmed) {
    return
  }

  const updatedTeams = teams.value.filter(
    (currentTeam) => String(currentTeam._id) !== String(team._id),
  )

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    tournament.value = await updateTournament(tournamentId, {
      teams: updatedTeams,
    })

    if (String(selectedTeamId.value) === String(team._id)) {
      selectedTeamId.value = updatedTeams[0]?._id ?? null
    }

    successMessage.value = 'Team removed successfully.'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to remove team'
  } finally {
    isUpdating.value = false
  }
}

async function handleAddPlayer() {
  if (!canManagePlayers.value) return

  const name = newPlayer.name.trim()
  const surname = newPlayer.surname.trim()

  if (!name || !surname || !selectedTeamId.value) return

  const teamsToUpdate = teams.value.map((team) => ({
    ...team,
    players: [...(team.players || [])],
  }))

  const team = teamsToUpdate.find(
    (team) => String(team._id) === String(selectedTeamId.value),
  )

  if (!team) return

  team.players.push({
    userId: authStore.user?._id || authStore.user?.id || null,
    name,
    surname,
    jerseyNumber: newPlayer.jerseyNumber.trim() || null,
  })

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    tournament.value = await updateTournament(tournamentId, {
      teams: teamsToUpdate,
    })

    resetPlayerForm()

    successMessage.value = `Player added to ${team.name}.`
  } catch (err) {
    errorMessage.value = err.message || 'Failed to register player'
  } finally {
    isUpdating.value = false
  }
}

function resetPlayerForm() {
  newPlayer.name = ''
  newPlayer.surname = ''
  newPlayer.jerseyNumber = ''
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

onMounted(loadTournament)
</script>

<template>
  <div class="tournament-view">
    <Breadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :current="tournament?.name || 'Tournament'"
    />

    <PageHeader
      v-if="!isLoading && tournament"
      :title="tournament.name"
    />

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

    <LoadingState
      v-if="isLoading"
      message="Loading tournament..."
    />

    <template v-else-if="tournament">
      <!-- Overview -->
      <Panel class="overview-panel">
        <div class="overview-header">
          <SportBadge :sport="tournament.sport" />
        </div>

        <div class="overview-stats">
          <div class="stat">
            <div class="stat-icon">
              <CalendarIcon />
            </div>

            <div>
              <span class="stat-label">Start Date</span>
              <strong>{{ tournament.startDate }}</strong>
            </div>
          </div>

          <div class="stat">
            <div class="stat-icon">
              <UsersIcon />
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

          <div class="stat">
            <div class="stat-icon">
              <UserIcon />
            </div>

            <div>
              <span class="stat-label">Players</span>
              <strong>{{ numberOfPlayers }}</strong>
            </div>
          </div>
        </div>

        <div class="overview-actions">
          <Button
            variant="secondary"
            class="navigation-button"
            @click="goToMatches"
          >
            <MatchesIcon />
            Matches
          </Button>

          <Button
            variant="secondary"
            class="navigation-button"
            @click="goToStandings"
          >
            <StandingsIcon />
            Standings
          </Button>

          <div class="overview-spacer"></div>

          <Button
            v-if="canManageTournament"
            variant="secondary"
            class="navigation-button"
            @click="goToEdit"
          >
            <PencilIcon />
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
            <p>
              Manage the teams and player rosters registered for this
              tournament.
            </p>
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
              <AddIcon />
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
              <UserIcon />
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
              v-model="selectedTeamId"
              class="form-input"
              :disabled="isUpdating"
            >
              <option
                v-for="team in teams"
                :key="team._id"
                :value="team._id"
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
        v-if="teams.length"
        class="teams-grid"
      >
        <TeamCard
          v-for="team in teams"
          :key="team._id"
          :team="team"
          :can-remove="canManageTournament"
          :disabled="isUpdating"
          @remove="handleRemoveTeam(team)"
        />
      </div>

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
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Overview */

.overview-panel {
  padding: 28px;
  border-radius: 18px;
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
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
  color: #8e8e93;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.stat strong {
  color: #111113;
  font-size: 14px;
}

.stat-muted {
  color: #8e8e93;
  font-weight: 600;
}

.overview-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
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

/* Section heading */

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 4px;
}

.section-heading h2 {
  margin: 0;
  color: #111113;
  font-size: 20px;
  font-weight: 750;
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
  color: #48484a;
  background: rgba(0, 0, 0, 0.05);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

/* Management panels */

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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
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

/* Forms */

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
  color: #111113;
  background: rgba(255, 255, 255, 0.95);
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

/* Teams */

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 18px;
}

/* Responsive */

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
