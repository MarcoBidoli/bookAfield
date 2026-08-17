<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchTournamentById, updateTournament } from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const tournamentId = route.params.id

const tournament = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  maxTeams: 2,
  startDate: '',
})

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) {
    return false
  }

  const currentUserId = authStore.user._id || authStore.user.id

  return String(tournament.value.creatorId) === String(currentUserId)
})

async function loadTournament() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await fetchTournamentById(tournamentId)

    tournament.value = data

    form.name = data.name || ''
    form.maxTeams = data.maxTeams || 2
    form.startDate = data.startDate || ''
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load tournament'
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!form.name.trim()) {
    errorMessage.value = 'Tournament name is required'
    return
  }

  if (Number(form.maxTeams) < 2) {
    errorMessage.value = 'Maximum teams must be at least 2'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateTournament(tournamentId, {
      name: form.name.trim(),
      maxTeams: Number(form.maxTeams),
      startDate: form.startDate,
    })

    successMessage.value = 'Tournament updated successfully.'

    // Return to details after a short moment.
    await router.push(`/tournaments/${tournamentId}`)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to update tournament'
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  router.push(`/tournaments/${tournamentId}`)
}

onMounted(() => {
  loadTournament()
})
</script>

<template>
  <div class="tournament-edit-view">
    <Breadcrumbs :tournament="tournament" current="Edit Tournament" />

    <!-- Feedback -->
    <div v-if="successMessage" class="banner success-banner">✓ {{ successMessage }}</div>

    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-box">Loading tournament...</div>

    <!-- Not owner -->
    <AquaPanel v-else-if="!isOwner" title="Edit Tournament">
      <div class="access-denied">You are not allowed to edit this tournament.</div>

      <div class="actions">
        <AquaButton @click="handleCancel"> ← Back to Tournament </AquaButton>
      </div>
    </AquaPanel>

    <!-- Tournament already active -->
    <AquaPanel v-else-if="tournament.status !== 'registration'" title="Edit Tournament">
      <div class="access-denied">
        Tournament details can only be edited while registration is open.
      </div>

      <div class="actions">
        <AquaButton @click="handleCancel"> ← Back to Tournament </AquaButton>
      </div>
    </AquaPanel>

    <!-- Edit form -->
    <AquaPanel v-else title="Edit Tournament">
      <div class="form-container">
        <div class="form-row">
          <label for="name"> Tournament Name </label>

          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Tournament name"
            :disabled="isSaving"
          />
        </div>

        <div class="form-row">
          <label for="maxTeams"> Maximum Teams </label>

          <input
            id="maxTeams"
            v-model.number="form.maxTeams"
            type="number"
            min="2"
            :disabled="isSaving"
          />

          <span class="field-hint">
            Current teams:
            {{ tournament.teams?.length || 0 }}
          </span>
        </div>

        <div class="form-row">
          <label for="startDate"> Start Date </label>

          <input id="startDate" v-model="form.startDate" type="date" :disabled="isSaving" />
        </div>
      </div>

      <div class="actions">
        <AquaButton variant="secondary" :disabled="isSaving" @click="handleCancel"> Cancel </AquaButton>

        <AquaButton
          variant="primary"
          :disabled="isSaving || !form.name.trim() || Number(form.maxTeams) < 2"
          @click="handleSave"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </AquaButton>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.tournament-edit-view {
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

.loading-box {
  font-size: 12px;
  color: #666;
  padding: 16px;
  text-align: center;
}

.access-denied {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  border-radius: 5px;
  padding: 12px;
  font-size: 12px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 14px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-row label {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

input {
  background: #ffffff;
  border: 1px solid #8e8e8e;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

input:focus {
  border-color: #38a5e8;
  box-shadow:
    0 0 5px #70c3ff,
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

input:disabled {
  background: #f2f2f2;
  color: #777;
}

.field-hint {
  font-size: 10px;
  color: #777;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}
</style>
