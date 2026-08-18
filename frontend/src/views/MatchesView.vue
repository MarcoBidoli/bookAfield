<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()
const authStore = useAuthStore()

const tournamentId = route.params.id
const tournament = ref(null)
const matches = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const bookings = ref([])
const selectedBookings = reactive({})

// State for recording score
const scoreInputs = reactive({})

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) return false
  const currentUserId = authStore.user._id || authStore.user.id
  return String(tournament.value.creatorId) === String(currentUserId)
})

// Group matches by round
const matchesByRound = computed(() => {
  const groups = {}
  for (const match of matches.value) {
    const round = match.round || 1
    if (!groups[round]) groups[round] = []
    groups[round].push(match)
  }
  return groups
})

async function loadMatches() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [tData, mData] = await Promise.all([
      fetchTournamentById(tournamentId),
      fetchTournamentMatches(tournamentId),
    ])

    tournament.value = tData
    matches.value = mData

    if (isOwner.value) {
      bookings.value = await fetchTournamentBookings(tournamentId)
    } else {
      bookings.value = []
    }

    for (const match of mData) {
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

    successMessage.value = `Field booking successfully assigned to ${match.teamAName} vs ${match.teamBName}`

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

    successMessage.value = `Score updated for ${match.teamAName} vs ${match.teamBName}!`
    await loadMatches()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to save score'
  } finally {
    isSubmitting.value = false
  }
}

function isMatchScheduled(match) {
  return !!(match.bookingId && match.date && match.slot)
}

onMounted(() => {
  loadMatches()
})
</script>

<template>
  <div class="matches-view">
    <!-- Breadcrumbs row -->
    <Breadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :parent="{
        label: tournament?.name,
        to: `/tournaments/${tournament?._id}`,
      }"
      current="Matches"
    />

    <!-- Feedback Banners -->
    <AppBanner v-if="successMessage" type="success" :message="successMessage" />
    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <!-- Header Panel -->
    <Panel :title="`Fixtures & Scores — ${tournament?.name || 'Tournament'}`">
      <div class="header-actions">
        <!-- Tournament owner only -->
        <router-link
          v-if="isOwner && tournament?.status === 'active'"
          :to="`/fields?tournamentId=${tournamentId}`"
        >
          <Button variant="primary">Book a Field</Button>
        </router-link>
      </div>
    </Panel>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading tournament match fixtures...</div>

    <!-- No Matches -->
    <div v-else-if="matches.length === 0" class="empty-state">
      <Panel title="Schedule">
        <p>No matches generated yet.</p>

        <p v-if="isOwner" style="margin-top: 8px">
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
            <!-- BYE Match -->
            <div v-if="!match.teamA || !match.teamB" class="bye-row">
              <span class="bye-team">
                {{ match.teamAName === 'BYE' ? match.teamBName : match.teamAName }}
              </span>

              <span class="bye-badge"> Rest Day (BYE) </span>
            </div>

            <!-- Standard Match -->
            <div v-else class="match-content">
              <!-- Teams + Score -->
              <div class="teams-versus">
                <span class="team-name team-home">
                  {{ match.teamAName }}
                </span>

                <div class="score-container">
                  <!-- Match already played -->
                  <template v-if="match.status === 'played'">
                    <span class="score-badge">
                      {{ match.result?.scoreA }}
                      -
                      {{ match.result?.scoreB }}
                    </span>
                  </template>

                  <!-- Tournament owner can enter score -->
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

                  <!-- Everyone else sees VS -->
                  <template v-else>
                    <span class="vs-badge"> VS </span>
                  </template>
                </div>

                <span class="team-name team-away">
                  {{ match.teamBName }}
                </span>
              </div>

              <!-- Match Schedule + Status -->
              <div class="match-meta">
                <div class="match-info">
                  <template v-if="isMatchScheduled(match)">
                    <span class="meta-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="meta-icon"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                      {{ match.date }}
                    </span>

                    <span class="meta-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="meta-icon"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {{ match.slot }}
                    </span>

                    <span v-if="match.field" class="meta-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="meta-icon"
                      >
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55-.47.98-.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      </svg>
                      {{ match.field.name }}
                    </span>

                    <span v-if="match.field?.address" class="meta-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="meta-icon"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {{ match.field.address }}
                    </span>
                  </template>

                  <span v-else class="meta-item unscheduled">
                    Unscheduled (Field booking required)
                  </span>
                </div>

                <span :class="['status-pill', `status-${match.status}`]">
                  {{ match.status }}
                </span>
              </div>

              <!-- Booking Assignment -->
              <div v-if="isOwner && tournament?.status === 'active'" class="booking-assignment">
                <label class="booking-label"> Field booking assignment: </label>

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

                      <template v-if="booking.fieldName"> — {{ booking.fieldName }} </template>
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
  color: #6e6e73;
  padding: 32px;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.match-card {
  background: #ffffff;
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
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.08);
}

.match-played {
  background: rgba(0, 0, 0, 0.01);
  border-color: rgba(0, 0, 0, 0.06);
}

.match-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-icon {
  color: #0071e3;
  flex-shrink: 0;
}

.meta-separator {
  color: #c7c7cc;
  font-size: 10px;
}

.teams-versus {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}

.team-name {
  font-size: 13px;
  font-weight: 700;
  color: #111113;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-home {
  text-align: right;
}

.team-away {
  text-align: left;
}

.score-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  margin-bottom: 10px;
}

.score-badge {
  background: #0071e3;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 980px;
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.2);
}

.vs-badge {
  color: #6e6e73;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.04);
  padding: 3px 10px;
  border-radius: 980px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.score-form {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.score-input {
  width: 40px;
  height: 32px;
  text-align: center;
  padding: 2px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #111113;
  transition: all 0.1s ease;
}

.score-input:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.score-colon {
  font-weight: 700;
  color: #6e6e73;
}

.btn-enter {
  font-size: 11px;
  padding: 4px 10px;
  height: 32px;
}

/* Isolated Inset Well for Booking Controls */
.booking-assignment {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.booking-label {
  font-size: 12px;
  font-weight: 700;
  color: #111113;
}

.booking-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.booking-select {
  flex: 1;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  height: 32px;
  color: #111113;
  outline: none;
  transition: all 0.1s ease;
}

.booking-select:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.btn-assign {
  font-size: 11px;
  padding: 4px 10px;
  height: 32px;
}

.match-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  font-weight: 500;
}

.meta-item {
  color: #6e6e73;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.unscheduled {
  color: #b71c1c;
  font-weight: 600;
}

.status-pill {
  padding: 2px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-upcoming {
  background: rgba(255, 149, 0, 0.12);
  color: #b25000;
  border: 1px solid rgba(255, 149, 0, 0.25);
}

.status-played {
  background: rgba(52, 199, 89, 0.12);
  color: #1b5e20;
  border: 1px solid rgba(52, 199, 89, 0.25);
}

.bye-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.bye-team {
  font-weight: 700;
  color: #111113;
}

.bye-badge {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 3px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 600;
  color: #6e6e73;
}
</style>
