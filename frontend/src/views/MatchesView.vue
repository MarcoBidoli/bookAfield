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

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

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

    // Only the tournament owner needs booking data.
    // /:id/bookings is protected by JWT + requireOwner().
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
    <!-- Breadcrumbs row  -->
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
    <div v-if="successMessage" class="banner success-banner">✓ {{ successMessage }}</div>

    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <!-- Header Panel -->
    <AquaPanel :title="`Fixtures & Scores — ${tournament?.name || 'Tournament'}`">
      <div class="header-actions">
        <!-- Tournament owner only -->
        <router-link
          v-if="isOwner && tournament?.status === 'active'"
          :to="`/fields?tournamentId=${tournamentId}`"
          style="margin-left: 8px"
        >
          <AquaButton>Book a Field</AquaButton>
        </router-link>
      </div>
    </AquaPanel>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading tournament match fixtures...</div>

    <!-- No Matches -->
    <div v-else-if="matches.length === 0" class="empty-state">
      <AquaPanel title="Schedule">
        <p>No matches generated yet.</p>

        <p v-if="isOwner" style="margin-top: 8px">
          Once all teams are registered in the tournament details page, generate the match fixtures
          to start the tournament.
        </p>
      </AquaPanel>
    </div>

    <!-- Matches -->
    <template v-else>
      <AquaPanel
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

                      <button
                        type="button"
                        class="btn-enter"
                        :disabled="isSubmitting"
                        @click="handleSaveScore(match)"
                      >
                        Enter
                      </button>
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
                    <span class="meta-item"> 📅 {{ match.date }} | ⏱ {{ match.slot }} </span>

                    <span v-if="match.field" class="meta-item"> 🏟️ {{ match.field.name }} </span>

                    <span v-if="match.field?.address" class="meta-item">
                      📍 {{ match.field.address }}
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

                  <button
                    type="button"
                    class="btn-assign"
                    :disabled="isSubmitting || !selectedBookings[match._id]"
                    @click="handleAssignBooking(match)"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AquaPanel>
    </template>
  </div>
</template>

<style scoped>
.matches-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.banner {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.success-banner {
  background: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.3);
  color: #155724;
}

.error-banner {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #721c24;
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
  color: #48484a;
  padding: 24px;
}

/* Transformed from a single vertical column into a responsive multi-column grid to prevent card clutter */
.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 14px;
}

.match-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.2s ease;
}

.match-played {
  background: rgba(245, 247, 250, 0.9);
  border-color: rgba(0, 0, 0, 0.1);
}

.match-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.teams-versus {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 6px auto 10px auto;
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
}

.score-badge {
  background: linear-gradient(135deg, #0051c7 0%, #003a94 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 980px;
  box-shadow: 0 2px 6px rgba(0, 81, 199, 0.25);
}

.vs-badge {
  color: #48484a;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.06);
  padding: 3px 8px;
  border-radius: 980px;
}

.score-form {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.score-input {
  width: 36px;
  height: 30px;
  text-align: center;
  padding: 2px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  color: #111113;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.score-input:focus {
  border-color: #0051c7;
  box-shadow: 0 0 0 3px rgba(0, 81, 199, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.score-colon {
  font-weight: 700;
  color: #48484a;
}

.btn-enter {
  background: #0051c7;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  cursor: pointer;
  height: 30px;
  transition: background 0.2s;
}

.btn-enter:hover {
  background: #0040a1;
}

.btn-enter:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Isolated Inset Well for Booking Controls */
.booking-assignment {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.booking-label {
  font-size: 11px;
  font-weight: 700;
  color: #111113;
}

.booking-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.booking-select {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 600;
  height: 30px;
  color: #111113;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.booking-select:focus {
  border-color: #0051c7;
  box-shadow: 0 0 0 3px rgba(0, 81, 199, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.btn-assign {
  background: #0051c7;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  cursor: pointer;
  height: 30px;
  transition: background 0.2s;
}

.btn-assign:hover {
  background: #0040a1;
}

.btn-assign:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.match-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 11px;
  font-weight: 500;
}

.meta-item {
  color: #48484a;
}

.unscheduled {
  color: #b25000;
  font-weight: 600;
}

.status-pill {
  padding: 2px 8px;
  border-radius: 980px;
  font-size: 10px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-upcoming {
  background: rgba(255, 193, 7, 0.15);
  color: #856404;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-played {
  background: rgba(40, 167, 69, 0.15);
  color: #155724;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.bye-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.bye-team {
  font-weight: 700;
  color: #111113;
}

.bye-badge {
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 980px;
  font-size: 10px;
  font-weight: 600;
  color: #48484a;
}

.back-link-row {
  display: flex;
  align-items: center;
}

.back-link {
  color: #0051c7;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
