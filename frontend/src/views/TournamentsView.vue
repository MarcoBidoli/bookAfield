<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchTournaments,
  createTournament,
  deleteTournament
} from '@/api/tournaments'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterToolbar from '@/components/FilterToolbar.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import AppBanner from '@/components/AppBanner.vue'
import TournamentCard from '@/components/TournamentCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const tournaments = ref([])
const searchQuery = ref('')
const selectedSportFilter = ref('all')
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const sportFilters = [
  { label: 'All Tournaments', value: 'all' },
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Volleyball', value: 'volleyball' }
]

const newTournament = reactive({
  name: '',
  sport: 'football',
  maxTeams: 4,
  startDate: getTomorrowDate()
})

function getTomorrowDate() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

async function loadTournaments() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const list = await fetchTournaments(searchQuery.value)
    tournaments.value = list
  } catch (err) {
    errorMessage.value = err.message || 'Error loading tournaments'
  } finally {
    isLoading.value = false
  }
}

function filteredTournaments() {
  if (selectedSportFilter.value === 'all') {
    return tournaments.value
  }

  return tournaments.value.filter(
    tournament => tournament.sport === selectedSportFilter.value
  )
}

function openTournament(tournamentId) {
  router.push(`/tournaments/${tournamentId}`)
}

async function handleCreateTournament() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const created = await createTournament({
      name: newTournament.name,
      sport: newTournament.sport,
      maxTeams: Number(newTournament.maxTeams),
      startDate: newTournament.startDate
    })

    successMessage.value = `Tournament "${created.name}" created successfully!`

    newTournament.name = ''
    newTournament.maxTeams = 4
    newTournament.sport = 'football'
    newTournament.startDate = getTomorrowDate()

    await loadTournaments()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to create tournament'
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(tournament) {
  const confirmed = window.confirm(
    `Delete tournament "${tournament.name}" and all scheduled matches?`
  )

  if (!confirmed) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteTournament(tournament._id)

    successMessage.value = `Tournament "${tournament.name}" deleted.`

    tournaments.value = tournaments.value.filter(
      item => item._id !== tournament._id
    )
  } catch (err) {
    errorMessage.value = err.message || 'Failed to delete tournament'
  }
}

function isCreator(tournament) {
  if (!authStore.isAuthenticated || !authStore.user) {
    return false
  }

  const currentUserId = authStore.user._id || authStore.user.id

  return String(tournament.creatorId) === String(currentUserId)
}

onMounted(() => {
  loadTournaments()
})
</script>

<template>
  <div class="tournaments-view">
    <Breadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      current="Available Tournaments"
    />

    <PageHeader
      title="Sports Tournaments"
      subtitle="Discover, join and host sports tournaments"
    />

    <AppBanner
      v-if="successMessage"
      type="success"
      :message="successMessage"
    />

    <AppBanner
      v-if="errorMessage"
      type="error"
      :message="errorMessage"
    />

    <!-- Create Tournament -->
    <Panel title="Create New Tournament">
      <div v-if="!authStore.isAuthenticated" class="auth-notice">
        <span>Sign in to host and manage sports tournaments.</span>

        <router-link to="/login">
          <Button>Sign In</Button>
        </router-link>
      </div>

      <form
        v-else
        class="create-form"
        @submit.prevent="handleCreateTournament"
      >
        <div class="form-row">
          <div class="form-group form-name">
            <label for="t-name">Tournament Name</label>

            <input
              id="t-name"
              v-model="newTournament.name"
              type="text"
              required
              placeholder="e.g. Summer Cup 2026"
            />
          </div>

          <div class="form-group">
            <label for="t-sport">Sport</label>

            <select
              id="t-sport"
              v-model="newTournament.sport"
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="volleyball">Volleyball</option>
            </select>
          </div>

          <div class="form-group">
            <label for="t-teams">Max Teams</label>

            <input
              id="t-teams"
              v-model.number="newTournament.maxTeams"
              type="number"
              min="2"
              max="32"
              required
            />
          </div>

          <div class="form-group">
            <label for="t-date">Start Date</label>

            <input
              id="t-date"
              v-model="newTournament.startDate"
              type="date"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="submit"
            :disabled="isSubmitting || !newTournament.name"
          >
            {{ isSubmitting ? 'Creating...' : 'Post Tournament' }}
          </Button>
        </div>
      </form>
    </Panel>

    <!-- Tournament Directory -->
    <Panel>
      <FilterToolbar
        v-model="searchQuery"
        v-model:modelFilter="selectedSportFilter"
        search-placeholder="Search tournaments..."
        :filters="sportFilters"
        @update:model-value="loadTournaments"
      />

      <LoadingState
        v-if="isLoading"
        message="Loading available tournaments..."
      />

      <EmptyState
        v-else-if="filteredTournaments().length === 0"
        title="No Tournaments Found"
        message="Try adjusting your search criteria or sport filters."
      />

      <div
        v-else
        class="tournaments-grid"
      >
        <TournamentCard
          v-for="tournament in filteredTournaments()"
          :key="tournament._id"
          :tournament="tournament"
          :is-creator="isCreator(tournament)"
          @click="openTournament(tournament._id)"
          @delete="handleDelete"
        />
      </div>
    </Panel>
  </div>
</template>

<style scoped>
.tournaments-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Create form */

.auth-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  color: #48484a;
  font-weight: 600;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 150px;
}

.form-name {
  flex: 2;
  min-width: 240px;
}

.form-group label {
  font-size: 11px;
  font-weight: 700;
  color: #111113;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #111113;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

/* Tournament grid */

.tournaments-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(320px, 1fr)
  );
  gap: 20px;
}

/* Responsive */

@media (max-width: 700px) {
  .tournaments-grid {
    grid-template-columns: 1fr;
  }

  .form-group,
  .form-name {
    min-width: 100%;
  }
}
</style>
