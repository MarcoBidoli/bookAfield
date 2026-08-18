<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { fetchTournamentById, fetchTournamentStandings } from '@/api/tournaments'

import Panel from '@/components/Panel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import SportBadge from '@/components/SportBadge.vue'
import Pill from '@/components/Pill.vue'

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

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'success'

    case 'registration':
    case 'upcoming':
      return 'warning'

    case 'completed':
    case 'played':
      return 'muted'

    default:
      return 'default'
  }
}

function formatStatus(status) {
  if (!status) return ''

  return status.charAt(0).toUpperCase() + status.slice(1)
}

onMounted(() => {
  loadStandings()
})
</script>

<template>
  <div class="standings-view">
    <!-- Breadcrumbs row -->
    <Breadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :parent="{
        label: tournament?.name,
        to: `/tournaments/${tournament?._id}`,
      }"
      current="Standings"
    />

    <!-- Feedback Banner -->
    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <!-- Header -->
    <Panel :title="`Standings — ${tournament?.name || 'Tournament'}`">
      <div class="header-content">
        <div class="header-info">
          <SportBadge v-if="tournament?.sport" :sport="tournament.sport" />
          <Pill
            v-if="tournament?.status"
            :variant="getStatusVariant(tournament.status)"
          >
            {{ formatStatus(tournament.status) }}
          </Pill>
        </div>
      </div>
    </Panel>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading tournament standings...</div>

    <!-- Empty -->
    <div v-else-if="standings.length === 0" class="empty-state">
      <Panel title="Standings">
        <p>No teams are currently registered in this tournament.</p>
      </Panel>
    </div>

    <!-- Standings Table -->
    <Panel v-else title="Tournament Table">
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
                <span class="pos-badge">
                  <span class="pos-badge">{{ index + 1 }}</span>
                </span>
            </td>

            <!-- Team -->
            <td class="team-cell">
              {{ team.name }}
            </td>

            <!-- Played -->
            <td>{{ team.played }}</td>

            <!-- Won -->
            <td>{{ team.won }}</td>

            <!-- Drawn -->
            <td>{{ team.drawn }}</td>

            <!-- Lost -->
            <td>{{ team.lost }}</td>

            <!-- Goals / Points scored -->
            <td>{{ team.scored }}</td>

            <!-- Goals / Points conceded -->
            <td>{{ team.conceded }}</td>

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
        <span>P = Played</span>
        <span>W = Won</span>
        <span>D = Drawn</span>
        <span>L = Lost</span>
        <span>GF = Scored</span>
        <span>GA = Conceded</span>
        <span>GD = Difference</span>
        <span>Pts = Points</span>
      </div>
    </Panel>
  </div>
</template>

<style scoped>
.standings-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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

/* --------------------------------------------------
   Loading / Empty
-------------------------------------------------- */

.loading-state,
.empty-state {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6e6e73;
  padding: 32px;
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
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Header */

.standings-table thead th {
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  color: #6e6e73;
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  background: rgba(0, 0, 0, 0.01);
}

.standing-row:hover {
  background: rgba(0, 113, 227, 0.04);
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
  background: rgba(0, 0, 0, 0.05);
  font-size: 11px;
  color: #6e6e73;
  font-weight: 700;
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
  color: #0071e3 !important;
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
  background: linear-gradient(135deg, #d0d0d0 0%, #9e9e9e 100%);
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
  color: #1b5e20;
}

.difference-cell.negative {
  color: #b71c1c;
}

/* --------------------------------------------------
   Legend
-------------------------------------------------- */

.table-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  color: #6e6e73;
  font-size: 11px;
  font-weight: 600;
}
</style>
