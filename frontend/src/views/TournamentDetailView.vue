<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchTournamentById,
  generateTournamentSchedule,
  updateTournament,
} from '@/api/tournaments'

import BasePanel from '@/components/BasePanel.vue'
import BaseButton from '@/components/BaseButton.vue'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import AppBanner from '@/components/AppBanner.vue'
import SportBadge from '@/components/SportBadge.vue'
import StatusPill from '@/components/StatusPill.vue'
import TeamCard from '@/components/TeamCard.vue'

import UserIcon from '@/components/icons/UserIcon.vue'
import UsersIcon from '@/components/icons/UsersIcon.vue'
import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import MatchesIcon from '@/components/icons/MatchesIcon.vue'
import StandingsIcon from '@/components/icons/StandingsIcon.vue'
import PencilIcon from '@/components/icons/PencilIcon.vue'
import BoltIcon from '@/components/icons/BoltIcon.vue'

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
const selectedTeamId = ref(null)

const newPlayer = reactive({
  name: '',
  surname: '',
  jerseyNumber: '',
})

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) {
    return false
  }

  const currentUserId = authStore.userId

  return String(tournament.value.creatorId) === String(currentUserId)
})

const teams = computed(() => {
  return Array.isArray(tournament.value?.teams) ? tournament.value.teams : []
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
  return canManageTournament.value && numberOfTeams.value < tournament.value.maxTeams
})

const canManagePlayers = computed(() => {
  return canManageTournament.value && numberOfTeams.value > 0
})

const canStartTournament = computed(() => {
  return canManageTournament.value && numberOfTeams.value === tournament.value.maxTeams
})

const selectedTeam = computed(() => {
  return teams.value.find((team) => String(team._id) === String(selectedTeamId.value))
})

const teamsRemaining = computed(() => {
  if (!tournament.value) return 0
  return tournament.value.maxTeams - numberOfTeams.value
})

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'success'
    case 'registration':
      return 'primary'
    case 'completed':
      return 'muted'
    default:
      return 'default'
  }
}

function formatStatus(status) {
  switch (status) {
    case 'active':
      return 'In progress'
    case 'registration':
      return 'Registration open'
    case 'completed':
      return 'Completed'
    default:
      return status || ''
  }
}

async function loadTournament() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    tournament.value = await fetchTournamentById(tournamentId)

    if (!selectedTeam.value && teams.value.length) {
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

    if (!selectedTeamId.value && tournament.value.teams?.length) {
      selectedTeamId.value = tournament.value.teams[0]._id
    }
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

  const confirmed = window.confirm(`Remove "${team.name}" from this tournament?`)

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
  if (!canManagePlayers.value) {
    return
  }

  const name = newPlayer.name.trim()
  const surname = newPlayer.surname.trim()

  if (!name || !surname || !selectedTeamId.value) {
    return
  }

  const teamsToUpdate = teams.value.map((team) => ({
    ...team,
    players: [...(team.players || [])],
  }))

  const team = teamsToUpdate.find((team) => String(team._id) === String(selectedTeamId.value))

  if (!team) {
    return
  }

  team.players.push({
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

async function handleRemovePlayer(team, playerIndex) {
  if (!canManagePlayers.value || !team) {
    return
  }

  const player = team.players?.[playerIndex]

  if (!player) {
    return
  }

  if (!window.confirm(`Remove "${player.name} ${player.surname}" from ${team.name}?`)) {
    return
  }

  const updatedTeams = teams.value.map((currentTeam) => {
    if (String(currentTeam._id) !== String(team._id)) {
      return currentTeam
    }

    return {
      ...currentTeam,
      players: currentTeam.players.filter((_, index) => index !== playerIndex),
    }
  })

  isUpdating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    tournament.value = await updateTournament(tournamentId, {
      teams: updatedTeams,
    })

    successMessage.value = 'Player removed successfully.'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to remove player'
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
    errorMessage.value = err.message || 'Failed to generate tournament schedule'
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
    <AppBreadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :current="tournament?.name || 'Tournament'"
    />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />
    <AppBanner v-if="successMessage" type="success" :message="successMessage" />

    <LoadingState v-if="isLoading" message="Loading tournament..." />

    <template v-else-if="tournament">
      <!-- Header BasePanel -->
      <BasePanel :title="tournament.name">
        <div class="header-content">
          <!-- Meta info -->
          <div class="header-meta">
            <SportBadge :sport="tournament.sport" />
            <StatusPill :variant="getStatusVariant(tournament.status)">
              {{ formatStatus(tournament.status) }}
            </StatusPill>
            <span class="meta-separator" />
            <span class="meta-stat">
              <CalendarIcon />
              {{ tournament.startDate }}
            </span>
            <span class="meta-stat">
              <UsersIcon />
              {{ numberOfTeams }} / {{ tournament.maxTeams }} teams
            </span>
            <span class="meta-stat">
              <UserIcon />
              {{ numberOfPlayers }} players
            </span>
          </div>

          <!-- Actions -->
          <div class="header-actions">
            <BaseButton variant="secondary" class="action-btn" @click="goToMatches">
              <MatchesIcon />
              Matches
            </BaseButton>

            <BaseButton variant="secondary" class="action-btn" @click="goToStandings">
              <StandingsIcon />
              Standings
            </BaseButton>

            <BaseButton
              v-if="isOwner"
              variant="secondary"
              class="action-btn"
              :disabled="!isRegistrationOpen"
              @click="goToEdit"
            >
              <PencilIcon />
              Edit
            </BaseButton>

            <BaseButton
              v-if="canStartTournament"
              variant="primary"
              class="action-btn action-btn--start"
              :disabled="isUpdating"
              @click="handleGenerateSchedule"
            >
              <BoltIcon />
              {{ isUpdating ? 'Starting…' : 'Start Tournament' }}
            </BaseButton>
          </div>
        </div>
      </BasePanel>

      <!-- Registration management (owner only, registration status) -->
      <BasePanel v-if="canManageTournament" title="Registration">
        <div class="registration-grid">
          <!-- Add Team -->
          <div v-if="canAddTeams" class="reg-section">
            <p class="reg-section-label">
              Register Team
              <span class="reg-count"
                >{{ teamsRemaining }} slot{{ teamsRemaining === 1 ? '' : 's' }} left</span
              >
            </p>

            <form class="reg-form" @submit.prevent="handleAddTeam">
              <div class="form-group form-group--grow">
                <label for="team-name">Team Name</label>
                <input
                  id="team-name"
                  v-model="newTeamName"
                  type="text"
                  placeholder="e.g. Red Hawks"
                  :disabled="isUpdating"
                />
              </div>

              <div class="form-submit">
                <BaseButton
                  type="submit"
                  variant="primary"
                  :disabled="isUpdating || !newTeamName.trim()"
                >
                  Add Team
                </BaseButton>
              </div>
            </form>
          </div>

          <!-- Full notice -->
          <div v-else class="reg-full-notice">
            <UsersIcon />
            <span>All {{ tournament.maxTeams }} team slots are filled.</span>
          </div>

          <!-- Add Player -->
          <div v-if="canManagePlayers" class="reg-section reg-section--player">
            <p class="reg-section-label">Add Player</p>

            <form class="reg-form reg-form--player" @submit.prevent="handleAddPlayer">
              <div class="form-group">
                <label for="player-team">Team</label>
                <select id="player-team" v-model="selectedTeamId" :disabled="isUpdating">
                  <option v-for="team in teams" :key="team._id" :value="team._id">
                    {{ team.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="player-name">First Name</label>
                <input
                  id="player-name"
                  v-model="newPlayer.name"
                  type="text"
                  placeholder="First name"
                  :disabled="isUpdating"
                />
              </div>

              <div class="form-group">
                <label for="player-surname">Surname</label>
                <input
                  id="player-surname"
                  v-model="newPlayer.surname"
                  type="text"
                  placeholder="Surname"
                  :disabled="isUpdating"
                />
              </div>

              <div class="form-group form-group--jersey">
                <label for="player-jersey">Number</label>
                <input
                  id="player-jersey"
                  v-model="newPlayer.jerseyNumber"
                  type="text"
                  placeholder="#"
                  :disabled="isUpdating"
                />
              </div>

              <div class="form-submit">
                <BaseButton
                  type="submit"
                  variant="secondary"
                  :disabled="isUpdating || !newPlayer.name.trim() || !newPlayer.surname.trim()"
                >
                  Add Player
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </BasePanel>

      <!-- Teams -->
      <BasePanel title="Teams">
        <div v-if="teams.length" class="teams-grid">
          <TeamCard
            v-for="team in teams"
            :key="team._id"
            :team="team"
            :can-remove="canManageTournament"
            :is-updating="isUpdating"
            @remove="handleRemoveTeam(team)"
            @remove-player="handleRemovePlayer(team, $event)"
          />
        </div>

        <EmptyState
          v-else
          title="No Teams Registered"
          message="Add teams to start building the tournament."
        />
      </BasePanel>
    </template>
  </div>
</template>

<style scoped>
.tournament-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  width: 100%;
  max-width: 1200px;

  margin: 0 auto;
  box-sizing: border-box;
}

/* =========================================================
   Header BasePanel
   ========================================================= */

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.header-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-separator {
  width: 1px;
  height: 16px;
  background: rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  margin: 0 2px;
}

.meta-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  color: var(--color-darkgray);
  font-size: 12px;
  font-weight: 500;
}

.meta-stat :deep(svg) {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 7px 11px;

  font-size: 12px;
  font-weight: 600;
}

.action-btn :deep(svg) {
  width: 14px;
  height: 14px;
}

.action-btn--start {
  gap: 7px;
}

/* =========================================================
   Registration BasePanel
   ========================================================= */

.registration-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.reg-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reg-section--player {
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.reg-section-label {
  margin: 0;

  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--color-black);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.reg-count {
  padding: 2px 8px;
  border-radius: 980px;
  background: rgba(0, 113, 227, 0.08);
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
}

.reg-full-notice {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(52, 199, 89, 0.07);
  border: 1px solid rgba(52, 199, 89, 0.2);

  color: #1b5e20;
  font-size: 13px;
  font-weight: 600;
}

.reg-full-notice :deep(svg) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Forms */

.reg-form {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

.reg-form--player {
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
  flex: 1;
}

.form-group--grow {
  flex: 2;
  min-width: 200px;
}

.form-group--jersey {
  flex: 0 0 80px;
  min-width: 80px;
}

.form-group label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-black);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-black);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-submit {
  flex-shrink: 0;
  padding-bottom: 0;
}

/* =========================================================
   Teams Grid
   ========================================================= */

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* =========================================================
   Responsive
   ========================================================= */

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .reg-form {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group,
  .form-group--grow,
  .form-group--jersey {
    flex: unset;
    min-width: unset;
    width: 100%;
  }

  .form-submit {
    width: 100%;
  }

  .form-submit :deep(.btn) {
    width: 100%;
    justify-content: center;
  }

  .teams-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .header-actions {
    flex-direction: column;
  }
}
</style>
