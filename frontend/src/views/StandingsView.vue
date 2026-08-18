<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { fetchTournamentById, fetchTournamentStandings } from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

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
    <!-- Breadcrumbs row  -->
    <Breadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :parent="{
        label: tournament?.name,
        to: `/tournaments/${tournament?._id}`,
      }"
      current="Standings"
    />

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
              <span class="pos-badge">{{ index + 1 }}</span>
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
  gap: 20px;
}

/* --------------------------------------------------
   Feedback
-------------------------------------------------- */

.banner {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.error-banner {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #721c24;
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
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sport-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 980px;

  background: rgba(0, 81, 199, 0.1);
  border: 1px solid rgba(0, 81, 199, 0.2);

  color: #0051c7;
  font-size: 11px;
  font-weight: 700;

  text-transform: capitalize;
}

/* --------------------------------------------------
   Status
-------------------------------------------------- */

.status-pill {
  padding: 4px 12px;
  border-radius: 980px;

  font-size: 11px;
  font-weight: 700;

  text-transform: capitalize;
}

.status-registration {
  background: rgba(255, 193, 7, 0.15);
  color: #856404;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-active {
  background: rgba(40, 167, 69, 0.15);
  color: #155724;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.status-completed {
  background: rgba(0, 0, 0, 0.06);
  color: #48484a;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

/* --------------------------------------------------
   Loading / Empty
-------------------------------------------------- */

.loading-state,
.empty-state {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #48484a;
  padding: 24px;
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

  font-size: 13px;

  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;

  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Header */

.standings-table thead th {
  padding: 10px 10px;

  background: rgba(0, 0, 0, 0.04);

  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  color: #48484a;

  font-size: 11px;
  font-weight: 700;

  text-align: center;

  white-space: nowrap;
}

.standings-table thead th:first-child {
  border-top-left-radius: 11px;
}

.standings-table thead th:last-child {
  border-top-right-radius: 11px;
}

/* Body */

.standing-row td {
  padding: 12px 10px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  color: #111113;

  text-align: center;

  white-space: nowrap;
  font-weight: 500;
}

.standing-row:last-child td {
  border-bottom: none;
}

/* Zebra striping & hover */

.standing-row:nth-child(even) {
  background: rgba(0, 0, 0, 0.015);
}

.standing-row:nth-child(odd) {
  background: transparent;
}

.standing-row:hover {
  background: rgba(0, 81, 199, 0.06);
}

/* --------------------------------------------------
   Columns
-------------------------------------------------- */

.position-column {
  width: 48px;
}

.position-cell {
  width: 48px;
  font-weight: 700;
}

.pos-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  font-size: 11px;
  color: #48484a;
}

.team-column {
  min-width: 200px;
  text-align: left !important;
}

.team-cell {
  min-width: 200px;
  font-weight: 700;
  color: #111113;
  text-align: left !important;
}

.points-column {
  width: 70px;
}

.points-cell {
  width: 70px;
  color: #0051c7 !important;
  font-size: 14px;
  font-weight: 800;
}

/* --------------------------------------------------
   Positions
-------------------------------------------------- */

.position-first .pos-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(255, 170, 0, 0.3);
}

.position-second .pos-badge {
  background: linear-gradient(135deg, #e0e0e0 0%, #b0b0b0 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.position-third .pos-badge {
  background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(205, 127, 50, 0.3);
}

/* --------------------------------------------------
   Goal / Point Difference
-------------------------------------------------- */

.difference-cell {
  font-weight: 700;
}

.difference-cell.positive {
  color: #28a745;
}

.difference-cell.negative {
  color: #dc3545;
}

/* --------------------------------------------------
   Legend
-------------------------------------------------- */

.table-legend {
  display: flex;
  flex-wrap: wrap;

  gap: 6px 16px;

  margin-top: 12px;
  padding-top: 10px;

  border-top: 1px solid rgba(0, 0, 0, 0.08);

  color: #48484a;
  font-size: 11px;
  font-weight: 600;
}
</style>
