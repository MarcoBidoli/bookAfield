<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchTournamentById, updateTournament } from '@/api/tournaments'

import BasePanel from '@/components/BasePanel.vue'
import BaseButton from '@/components/BaseButton.vue'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import LoadingState from '@/components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const tournamentId = route.params.id

const tournament = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const numberOfTeams = computed(() => {
  return tournament.value?.teams?.length ?? 0
})

const form = reactive({
  name: '',
  maxTeams: 2,
  startDate: '',
})

const isOwner = computed(() => {
  if (!tournament.value || !authStore.isAuthenticated || !authStore.user) {
    return false
  }

  const currentUserId = authStore.userId

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
    <!-- AppBreadcrumbs row  -->
    <AppBreadcrumbs
      section="Tournaments"
      section-to="/tournaments"
      :parent="{
        label: tournament?.name,
        to: `/tournaments/${tournament?._id}`,
      }"
      current="Edit Tournament"
    />

    <!-- Feedback -->
    <AppBanner v-if="successMessage" type="success" :message="successMessage" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <!-- Loading -->
    <LoadingState v-if="isLoading" message="Loading tournament..." />

    <!-- Not owner -->
    <BasePanel v-else-if="!isOwner" title="Edit Tournament">
      <div class="access-denied">You are not allowed to edit this tournament.</div>

      <div class="actions">
        <BaseButton @click="handleCancel"> ← Back to Tournament </BaseButton>
      </div>
    </BasePanel>

    <!-- Tournament already active -->
    <BasePanel v-else-if="tournament.status !== 'registration'" title="Edit Tournament">
      <div class="access-denied">
        Tournament details can only be edited while registration is open.
      </div>

      <div class="actions">
        <BaseButton @click="handleCancel"> ← Back to Tournament </BaseButton>
      </div>
    </BasePanel>

    <!-- Edit form -->
    <BasePanel v-else title="Edit Tournament">
      <div class="form-container">
        <div class="form-row">
          <label for="name">Tournament Name</label>

          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Tournament name"
            class="form-input"
            :disabled="isSaving"
          />
        </div>

        <div class="form-row">
          <label for="maxTeams">Maximum Teams</label>

          <input
            id="maxTeams"
            v-model.number="form.maxTeams"
            type="number"
            min="2"
            class="form-input"
            :disabled="isSaving"
          />

          <span class="field-hint"> Current teams: {{ numberOfTeams }} </span>
        </div>

        <div class="form-row">
          <label for="startDate">Start Date</label>

          <input
            id="startDate"
            v-model="form.startDate"
            type="date"
            class="form-input"
            :disabled="isSaving"
          />
        </div>
      </div>

      <div class="actions">
        <BaseButton variant="secondary" :disabled="isSaving" @click="handleCancel">
          Cancel
        </BaseButton>

        <BaseButton
          variant="primary"
          :disabled="isSaving || !form.name.trim() || Number(form.maxTeams) < 2"
          @click="handleSave"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </BaseButton>
      </div>
    </BasePanel>
  </div>
</template>

<style scoped>
.tournament-edit-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.access-denied {
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #856404;
  border-radius: 10px;
  padding: 14px;
  font-size: 12px;
  font-weight: 600;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row label {
  font-size: 11px;
  font-weight: 700;
  color: #111113;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  outline: none;
  color: #111113;
  height: 32px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.form-input:focus {
  border-color: var(--color-primary-dark) 7;
  box-shadow:
    0 0 0 3px rgba(0, 81, 199, 0.25),
    inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.form-input:disabled {
  background: rgba(0, 0, 0, 0.04);
  color: #48484a;
  cursor: not-allowed;
}

.field-hint {
  font-size: 11px;
  color: #48484a;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}
</style>
