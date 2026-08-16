<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchTournamentById,
  fetchTournamentMatches,
  recordMatchScore
} from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'

const route = useRoute()
const authStore = useAuthStore()

const tournamentId = route.params.id
const tournament = ref(null)
const matches = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

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
      fetchTournamentMatches(tournamentId)
    ])
    tournament.value = tData
    matches.value = mData

    // Initialize score inputs for played/upcoming matches
    for (const match of mData) {
      scoreInputs[match._id] = {
        scoreA: match.result?.scoreA ?? '',
        scoreB: match.result?.scoreB ?? ''
      }
    }
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load matches'
  } finally {
    isLoading.value = false
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
      scoreB: Number(input.scoreB)
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
  return !!(match.date && match.slot)
}

function isMatchPastOrToday(dateStr) {
  if (!dateStr) return false
  const matchDate = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return matchDate <= today
}

onMounted(() => {
  loadMatches()
})
</script>

<template>
  <div class="matches-view">
    <!-- Feedback Banners -->
    <div v-if="successMessage" class="banner success-banner">
      ✓ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="banner error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Header Panel -->
    <AquaPanel :title="`Fixtures & Scores — ${tournament?.name || 'Tournament'}`">
      <div class="header-actions">
        <router-link :to="`/tournaments/${tournamentId}`">
          <AquaButton>← Details & Teams</AquaButton>
        </router-link>
        <router-link :to="`/tournaments/${tournamentId}/standings`" style="margin-left: 8px;">
          <AquaButton>Standings Table</AquaButton>
        </router-link>
        <router-link
          v-if="isOwner"
          :to="`/fields?tournamentId=${tournamentId}`"
          style="margin-left: 8px;"
        >
          <AquaButton>Book a Field</AquaButton>
        </router-link>
      </div>
    </AquaPanel>

    <div v-if="isLoading" class="loading-state">
      Loading tournament match fixtures...
    </div>

    <div v-else-if="matches.length === 0" class="empty-state">
      <AquaPanel title="Schedule">
        <p>No matches generated yet.</p>
        <p v-if="isOwner" style="margin-top: 8px;">
          Once all teams are registered in the tournament details page, generate the match fixtures to start the tournament.
        </p>
      </AquaPanel>
    </div>

    <!-- Matches Grouped by Round -->
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
            :class="['match-card', { 'match-played': match.status === 'played' }]"
          >
            <!-- BYE Match -->
            <div v-if="!match.teamA || !match.teamB" class="bye-row">
              <span class="bye-team">{{ match.teamAName === 'BYE' ? match.teamBName : match.teamAName }}</span>
              <span class="bye-badge">Rest Day (BYE)</span>
            </div>

            <!-- Standard Match -->
            <div v-else class="match-content">
              <div class="teams-versus">
                <span class="team-name team-home">{{ match.teamAName }}</span>

                <!-- Score Display or Input -->
                <div class="score-container">
                  <template v-if="match.status === 'played'">
                    <span class="score-badge">
                      {{ match.result?.scoreA }} - {{ match.result?.scoreB }}
                    </span>
                  </template>
                  <template v-else-if="isOwner">
                    <div class="score-form">
                      <input
                        v-model.number="scoreInputs[match._id].scoreA"
                        type="number"
                        min="0"
                        class="score-input"
                        placeholder="0"
                      />
                      <span class="score-colon">:</span>
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
                  <template v-else>
                    <span class="vs-badge">VS</span>
                  </template>
                </div>

                <span class="team-name team-away">{{ match.teamBName }}</span>
              </div>

              <!-- Match Schedule Info -->
              <div class="match-meta">
                <span v-if="isMatchScheduled(match)" class="meta-item">
                  📅 {{ match.date }} | ⏱ {{ match.slot }}
                </span>
                <span v-else class="meta-item unscheduled">
                  ⚠️ Unscheduled (Field booking required)
                </span>

                <span :class="['status-pill', `status-${match.status}`]">
                  {{ match.status }}
                </span>
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

.header-actions {
  display: flex;
  align-items: center;
}

.loading-state, .empty-state {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 16px;
}

.matches-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-card {
  background: #ffffff;
  border: 1px solid #c8c8c8;
  border-radius: 6px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.match-played {
  background: #fbfbfb;
  border-color: #b8c8d8;
}

.teams-versus {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.team-name {
  font-size: 13px;
  font-weight: bold;
  color: #222;
  flex: 1;
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
  min-width: 140px;
}

.score-badge {
  background: linear-gradient(180deg, #5ca0f2 0%, #1a62d6 100%);
  color: #ffffff;
  font-weight: bold;
  font-size: 13px;
  padding: 3px 14px;
  border-radius: 12px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.vs-badge {
  color: #888;
  font-size: 11px;
  font-weight: bold;
  background: #eaeaea;
  padding: 2px 8px;
  border-radius: 10px;
}

.score-form {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.score-input {
  width: 32px;
  text-align: center;
  padding: 3px;
  font-size: 12px;
  border: 1px solid #8e8e8e;
  border-radius: 4px;
  outline: none;
}

.score-input:focus {
  border-color: #38a5e8;
  box-shadow: 0 0 4px #70c3ff;
}

.score-colon {
  font-weight: bold;
  color: #444;
}

.btn-enter {
  background: linear-gradient(180deg, #8bcbfc 0%, #3092f7 48%, #0d6fe3 50%, #1e87f0 100%);
  border: 1px solid #08489b;
  border-radius: 8px;
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  padding: 3px 8px;
  cursor: pointer;
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.4);
}

.btn-enter:hover {
  background: linear-gradient(180deg, #0d6fe3 0%, #3092f7 100%);
}

.btn-enter:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.match-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid #eee;
  font-size: 11px;
}

.meta-item {
  color: #666;
}

.unscheduled {
  color: #b06000;
  font-weight: 500;
}

.status-pill {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  text-transform: capitalize;
}

.status-upcoming {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.status-played {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.bye-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.bye-team {
  font-weight: bold;
  color: #555;
}

.bye-badge {
  background: #e8e8e8;
  border: 1px solid #ccc;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  color: #666;
}
</style>
