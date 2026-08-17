<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { fetchTournamentById, fetchTournamentStandings } from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'

const route = useRoute()

const tournamentId = route.params.id

const tournament = ref(null)
const standings = ref([])

const isLoading = ref(true)
const errorMessage = ref('')

async function loadStandings() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [tournamentData, standingsData] = await Promise.all([
      fetchTournamentById(tournamentId),
      fetchTournamentStandings(tournamentId),
    ])

    tournament.value = tournamentData
    standings.value = standingsData
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load tournament standings'
  } finally {
    isLoading.value = false
  }
}

function formatDifference(value) {
  if (value > 0) return `+${value}`
  return value
}

function getPositionClass(index) {
  if (index === 0) return 'position-first'
  if (index === 1) return 'position-second'
  if (index === 2) return 'position-third'

  return ''
}

onMounted(() => {
  loadStandings()
})
</script>

<template>
  <div class="standings-view">
    <!-- Error Banner -->
    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <!-- Header -->
    <AquaPanel :title="`Standings — ${tournament?.name || 'Tournament'}`">
      <div class="header-content">
        <div class="header-info">
          <span v-if="tournament?.sport" class="sport-badge">
            {{ tournament.sport }}
          </span>

          <span v-if="tournament?.status" :class="['status-pill', `status-${tournament.status}`]">
            {{ tournament.status }}
          </span>
        </div>

        <div class="header-actions">
          <router-link :to="`/tournaments/${tournamentId}`">
            <AquaButton> ← Details & Teams </AquaButton>
          </router-link>

          <router-link :to="`/tournaments/${tournamentId}/matches`">
            <AquaButton> Fixtures & Scores </AquaButton>
          </router-link>
        </div>
      </div>
    </AquaPanel>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading tournament standings...</div>

    <!-- Empty -->
    <div v-else-if="standings.length === 0" class="empty-state">
      <AquaPanel title="Standings">
        <p>No teams are currently registered in this tournament.</p>
      </AquaPanel>
    </div>

    <!-- Standings -->
    <AquaPanel v-else title="Tournament Table">
      <div class="table-wrapper">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="position-column">#</th>

              <th class="team-column">Team</th>

              <th>P</th>

              <th>W</th>

              <th>D</th>

              <th>L</th>

              <th>GF</th>

              <th>GA</th>

              <th>GD</th>

              <th class="points-column">Pts</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(team, index) in standings"
              :key="team.teamId"
              :class="['standing-row', getPositionClass(index)]"
            >
              <!-- Position -->
              <td class="position-cell">
                {{ index + 1 }}
              </td>

              <!-- Team -->
              <td class="team-cell">
                {{ team.name }}
              </td>

              <!-- Played -->
              <td>
                {{ team.played }}
              </td>

              <!-- Won -->
              <td>
                {{ team.won }}
              </td>

              <!-- Drawn -->
              <td>
                {{ team.drawn }}
              </td>

              <!-- Lost -->
              <td>
                {{ team.lost }}
              </td>

              <!-- Goals / Points scored -->
              <td>
                {{ team.scored }}
              </td>

              <!-- Goals / Points conceded -->
              <td>
                {{ team.conceded }}
              </td>

              <!-- Difference -->
              <td
                :class="[
                  'difference-cell',
                  {
                    positive: team.diff > 0,
                    negative: team.diff < 0,
                  },
                ]"
              >
                {{ formatDifference(team.diff) }}
              </td>

              <!-- Points -->
              <td class="points-cell">
                {{ team.points }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div class="table-legend">
        <span> P = Played </span>

        <span> W = Won </span>

        <span> D = Drawn </span>

        <span> L = Lost </span>

        <span> GF = Scored </span>

        <span> GA = Conceded </span>

        <span> GD = Difference </span>

        <span> Pts = Points </span>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.standings-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* --------------------------------------------------
   Feedback
-------------------------------------------------- */

.banner {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.error-banner {
  background-color: #ffe6e6;
  border: 1px solid #ff9999;
  color: #990000;
}

/* --------------------------------------------------
   Header
-------------------------------------------------- */

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sport-badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 10px;

  background: #e7f2ff;
  border: 1px solid #a9ccef;

  color: #245b8d;
  font-size: 10px;
  font-weight: bold;

  text-transform: capitalize;
}

/* --------------------------------------------------
   Status
-------------------------------------------------- */

.status-pill {
  padding: 3px 9px;
  border-radius: 10px;

  font-size: 10px;
  font-weight: bold;

  text-transform: capitalize;
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
  background: #e8e8e8;
  color: #666;
  border: 1px solid #ccc;
}

/* --------------------------------------------------
   Loading / Empty
-------------------------------------------------- */

.loading-state,
.empty-state {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 16px;
}

/* --------------------------------------------------
   Table
-------------------------------------------------- */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.standings-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  font-size: 12px;

  border: 1px solid #c8c8c8;
  border-radius: 6px;
  overflow: hidden;

  background: #ffffff;
}

/* Header */

.standings-table thead th {
  padding: 8px 7px;

  background: linear-gradient(180deg, #f7f7f7 0%, #dedede 100%);

  border-bottom: 1px solid #bcbcbc;

  color: #444;

  font-size: 10px;
  font-weight: bold;

  text-align: center;

  white-space: nowrap;
}

.standings-table thead th:first-child {
  border-top-left-radius: 5px;
}

.standings-table thead th:last-child {
  border-top-right-radius: 5px;
}

/* Body */

.standing-row td {
  padding: 9px 7px;

  border-bottom: 1px solid #e6e6e6;

  color: #444;

  text-align: center;

  white-space: nowrap;
}

.standing-row:last-child td {
  border-bottom: none;
}

/* Zebra striping */

.standing-row:nth-child(even) {
  background: #f7f9fb;
}

.standing-row:nth-child(odd) {
  background: #ffffff;
}

.standing-row:hover {
  background: #edf6ff;
}

/* --------------------------------------------------
   Columns
-------------------------------------------------- */

.position-column {
  width: 42px;
}

.position-cell {
  width: 42px;

  font-weight: bold;
  color: #666;
}

.team-column {
  min-width: 180px;
  text-align: left !important;
}

.team-cell {
  min-width: 180px;

  font-weight: bold;
  color: #222;

  text-align: left !important;
}

.points-column {
  width: 60px;
}

.points-cell {
  width: 60px;

  color: #174f9c !important;
  font-size: 13px;
  font-weight: bold;
}

/* --------------------------------------------------
   Positions
-------------------------------------------------- */

.position-first .position-cell {
  color: #c28a00;
  font-size: 13px;
}

.position-second .position-cell {
  color: #777;
  font-size: 13px;
}

.position-third .position-cell {
  color: #a15c32;
  font-size: 13px;
}

/* --------------------------------------------------
   Goal / Point Difference
-------------------------------------------------- */

.difference-cell {
  font-weight: bold;
}

.difference-cell.positive {
  color: #287a45;
}

.difference-cell.negative {
  color: #b33a3a;
}

/* --------------------------------------------------
   Legend
-------------------------------------------------- */

.table-legend {
  display: flex;
  flex-wrap: wrap;

  gap: 5px 14px;

  margin-top: 10px;
  padding-top: 8px;

  border-top: 1px solid #e5e5e5;

  color: #777;
  font-size: 10px;
}
</style>
