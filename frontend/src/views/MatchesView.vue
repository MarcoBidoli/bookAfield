<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  assignMatchBooking,
  fetchTournamentBookings,
  fetchTournamentById,
  fetchTournamentMatches,
  recordMatchScore,
} from '@/api/tournaments'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import Pill from '@/components/Pill.vue'

import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import ClockIcon from '@/components/icons/ClockIcon.vue'
import TrophyIcon from '@/components/icons/TrophyIcon.vue'
import PinPointIcon from '@/components/icons/PinPointIcon.vue'
import StandingsIcon from '@/components/icons/StandingsIcon.vue'

const route = useRoute()
const authStore = useAuthStore()

const tournamentId = route.params.id

const tournament = ref(null)
const matches = ref([])
const bookings = ref([])

const isLoading = ref(true)
const isSubmitting = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const selectedBookings = reactive({})
const scoreInputs = reactive({})

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) {
    return false
  }

  const currentUserId = authStore.user._id || authStore.user.id

  return String(tournament.value.creatorId) === String(currentUserId)
})

const matchesByRound = computed(() => {
  const groups = {}

  for (const match of matches.value) {
    const round = match.round || 1

    if (!groups[round]) {
      groups[round] = []
    }

    groups[round].push(match)
  }

  return groups
})

async function loadMatches() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [tournamentData, matchesData] = await Promise.all([
      fetchTournamentById(tournamentId),
      fetchTournamentMatches(tournamentId),
    ])

    tournament.value = tournamentData
    matches.value = matchesData

    if (isOwner.value) {
      bookings.value = await fetchTournamentBookings(tournamentId)
    } else {
      bookings.value = []
    }

    for (const match of matchesData) {
      scoreInputs[match._id] = {
        scoreA: match.result?.scoreA ?? '',
        scoreB: match.result?.scoreB ?? '',
      }

      selectedBookings[match._id] = match.bookingId ? String(match.bookingId) : ''
    }
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load matches'
  } finally {
    isLoading.value = false
  }
}

async function handleAssignBooking(match) {
  const bookingId = selectedBookings[match._id]

  if (!bookingId) {
    errorMessage.value = 'Please select a booking'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await assignMatchBooking(match._id, bookingId)

    successMessage.value =
      `Field booking successfully assigned to ` + `${match.teamAName} vs ${match.teamBName}`

    await loadMatches()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to assign booking'
  } finally {
    isSubmitting.value = false
  }
}

async function handleSaveScore(match) {
  const input = scoreInputs[match._id]

  if (input.scoreA === '' || input.scoreB === '') {
    errorMessage.value = 'Please enter both scores'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await recordMatchScore(match._id, {
      scoreA: Number(input.scoreA),
      scoreB: Number(input.scoreB),
    })

    successMessage.value = `Score updated for ${match.teamAName} vs ` + `${match.teamBName}!`

    await loadMatches()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to save score'
  } finally {
    isSubmitting.value = false
  }
}

function isMatchScheduled(match) {
  return Boolean(match.bookingId && match.date && match.slot)
}

const router = useRouter()

function goToStandings() {
  router.push(`/tournaments/${route.params.id}/standings`)
}

function goToBookField() {
  router.push(`/fields?tournamentId=${tournamentId}`)
}

onMounted(loadMatches)
</script>

<template>
  <div class="matches-view">
    <!-- Breadcrumbs -->
    <Breadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :parent="{
        label: tournament?.name,
        to: `/tournaments/${tournament?._id}`,
      }"
      current="Matches"
    />

    <!-- Feedback -->
    <AppBanner v-if="successMessage" type="success" :message="successMessage" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <!-- Header -->
    <Panel :title="`Fixtures & Scores — ${tournament?.name || 'Tournament'}`">
      <div class="header-actions">
        <Button
          v-if="isOwner && tournament?.status === 'active'"
          variant="primary"
          @click="goToBookField"
        >
          Book a Field
        </Button>
        <Button variant="secondary" class="navigation-button" @click="goToStandings">
          <StandingsIcon />
          Standings
        </Button>
      </div>
    </Panel>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading tournament match fixtures...</div>

    <!-- Empty -->
    <div v-else-if="matches.length === 0" class="empty-state">
      <Panel title="Schedule">
        <p>No matches generated yet.</p>

        <p v-if="isOwner" class="empty-description">
          Once all teams are registered in the tournament details page, generate the match fixtures
          to start the tournament.
        </p>
      </Panel>
    </div>

    <!-- Matches -->
    <template v-else>
      <Panel
        v-for="(roundMatches, roundNum) in matchesByRound"
        :key="roundNum"
        :title="`Round ${roundNum} Fixtures`"
      >
        <div class="matches-grid">
          <div
            v-for="match in roundMatches"
            :key="match._id"
            :class="[
              'match-card',
              {
                'match-played': match.status === 'played',
              },
            ]"
          >
            <!-- BYE -->
            <div v-if="!match.teamA || !match.teamB" class="bye-row">
              <span class="bye-team">
                {{ match.teamAName === 'BYE' ? match.teamBName : match.teamAName }}
              </span>

              <Pill variant="secondary"> Rest Day </Pill>
            </div>

            <!-- STANDARD MATCH -->
            <div v-else class="match-content">
              <!-- Teams / Score -->
              <div class="teams-versus">
                <span class="team-name team-home">
                  {{ match.teamAName }}
                </span>

                <div class="score-container">
                  <!-- Played -->
                  <template v-if="match.status === 'played'">
                    <span class="score-badge">
                      {{ match.result?.scoreA }}
                      -
                      {{ match.result?.scoreB }}
                    </span>
                  </template>

                  <!-- Owner enters score -->
                  <template v-else-if="isOwner">
                    <div class="score-form">
                      <input
                        v-model.number="scoreInputs[match._id].scoreA"
                        type="number"
                        min="0"
                        class="score-input"
                        placeholder="0"
                      />

                      <span class="score-colon"> : </span>

                      <input
                        v-model.number="scoreInputs[match._id].scoreB"
                        type="number"
                        min="0"
                        class="score-input"
                        placeholder="0"
                      />

                      <Button
                        type="button"
                        variant="primary"
                        class="btn-enter"
                        :disabled="isSubmitting"
                        @click="handleSaveScore(match)"
                      >
                        Enter
                      </Button>
                    </div>
                  </template>

                  <!-- Everyone else -->
                  <template v-else>
                    <Pill variant="secondary"> VS </Pill>
                  </template>
                </div>

                <span class="team-name team-away">
                  {{ match.teamBName }}
                </span>
              </div>

              <!-- Match metadata -->
              <div class="match-meta">
                <div class="match-info">
                  <!-- Scheduled -->
                  <template v-if="isMatchScheduled(match)">
                    <span class="meta-item">
                      <CalendarIcon />
                      {{ match.date }}
                    </span>

                    <span class="meta-item">
                      <ClockIcon />
                      {{ match.slot }}
                    </span>

                    <span v-if="match.field" class="meta-item">
                      <TrophyIcon />
                      {{ match.field.name }}
                    </span>

                    <span v-if="match.field?.address" class="meta-item">
                      <PinPointIcon />
                      {{ match.field.address }}
                    </span>
                  </template>

                  <!-- Not scheduled -->
                  <span v-else-if="isOwner" class="meta-item unscheduled">
                    <CalendarIcon />
                    Unscheduled
                    <span> (Field booking required) </span>
                  </span>
                </div>

                <Pill :variant="match.status === 'played' ? 'success' : 'warning'">
                  {{ match.status === 'played' ? 'Played' : 'Upcoming' }}
                </Pill>
              </div>

              <!-- Booking assignment -->
              <div v-if="isOwner && tournament?.status === 'active'" class="booking-assignment">
                <label class="booking-label"> Field booking assignment </label>

                <div class="booking-controls">
                  <select
                    v-model="selectedBookings[match._id]"
                    class="booking-select"
                    :disabled="isSubmitting"
                  >
                    <option value="">-- Select a tournament booking --</option>

                    <option
                      v-for="booking in bookings"
                      :key="booking._id"
                      :value="String(booking._id)"
                    >
                      {{ booking.date }}
                      |
                      {{ booking.slot }}

                      <template v-if="booking.fieldName">
                        —
                        {{ booking.fieldName }}
                      </template>
                    </option>
                  </select>

                  <Button
                    type="button"
                    variant="primary"
                    class="btn-assign"
                    :disabled="isSubmitting || !selectedBookings[match._id]"
                    @click="handleAssignBooking(match)"
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </template>
  </div>
</template>

<style scoped>
.navigation-button,
.start-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.matches-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.loading-state,
.empty-state {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-lightgray-text);
  padding: 32px;
}

.empty-description {
  margin-top: 8px;
  color: var(--color-lightgray-text);
  line-height: 1.5;
}

/* --------------------------------------------------
   Matches
-------------------------------------------------- */

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.match-card {
  background: var(--color-white);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.1s ease;
}

.match-card:hover {
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.08);
}

.match-played {
  background: rgba(0, 0, 0, 0.01);
  border-color: rgba(0, 0, 0, 0.06);
}

/* --------------------------------------------------
   Teams
-------------------------------------------------- */

.teams-versus {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}

.team-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--color-black);
  font-size: 13px;
  font-weight: 700;
}

.team-home {
  text-align: right;
}

.team-away {
  text-align: left;
}

/* --------------------------------------------------
   Score
-------------------------------------------------- */

.score-container {
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 110px;
  margin-bottom: 10px;
}

.score-badge {
  background: var(--color-primary);
  color: var(--color-white);

  font-size: 14px;
  font-weight: 700;

  padding: 4px 12px;
  border-radius: 980px;

  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.2);
}

.score-form {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.score-input {
  width: 40px;
  height: 32px;

  padding: 2px;

  text-align: center;

  font-size: 13px;
  font-weight: 600;

  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;

  outline: none;

  background: var(--color-white);
  color: var(--color-black);
}

.score-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.score-colon {
  font-weight: 700;
  color: var(--color-lightgray-text);
}

.btn-enter {
  font-size: 11px;
  padding: 4px 10px;
  height: 32px;
}

/* --------------------------------------------------
   Match metadata
-------------------------------------------------- */

.match-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-top: 12px;

  border-top: 1px solid rgba(0, 0, 0, 0.06);

  font-size: 12px;
  font-weight: 500;

  gap: 12px;
}

.match-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  color: var(--color-lightgray-text);
}

.meta-item :deep(svg) {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.unscheduled {
  color: var(--color-lightgray-text);
  font-weight: 600;
}

/* --------------------------------------------------
   Booking assignment
-------------------------------------------------- */

.booking-assignment {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.booking-label {
  color: var(--color-lightgray-text);
  font-size: 12px;
  font-weight: 700;
}

.booking-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.booking-select {
  flex: 1;
  min-width: 0;

  height: 32px;

  padding: 6px 10px;

  background: var(--color-white);
  color: var(--color-black);

  border: 1px solid rgba(0, 0, 0, 0.15);

  border-radius: 8px;

  font-size: 12px;
  font-weight: 500;

  outline: none;
}

.booking-select:focus {
  border-color: var(--color-primary-hover-light);
}

.btn-assign {
  height: 32px;
  padding: 4px 10px;
  font-size: 11px;
}

/* --------------------------------------------------
   BYE
-------------------------------------------------- */

.bye-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.bye-team {
  color: var(--color-black);
  font-size: 13px;
  font-weight: 700;
}

/* --------------------------------------------------
   Responsive
-------------------------------------------------- */

@media (max-width: 700px) {
  .matches-grid {
    grid-template-columns: 1fr;
  }

  .match-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .match-info {
    width: 100%;
  }

  .booking-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .booking-select {
    width: 100%;
  }

  .booking-controls :deep(.btn) {
    width: 100%;
  }
}
</style>
