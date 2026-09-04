<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { bookFieldSlot, fetchFieldById, fetchFieldSlots } from '@/api/fields'
import { fetchTournaments } from '@/api/tournaments'

import BasePanel from '@/components/BasePanel.vue'
import BaseButton from '@/components/BaseButton.vue'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import SportBadge from '@/components/SportBadge.vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import StatusPill from '@/components/StatusPill.vue'

import ClockIcon from '@/components/icons/ClockIcon.vue'
import PinPointIcon from '@/components/icons/PinPointIcon.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const selectedSlots = ref([])

const fieldId = route.params.id

const field = ref(null)
const tournaments = ref([])

const bookingType = ref('standard')
const selectedTournamentId = ref('')

const selectedDate = ref(getTomorrowDate())
const availableSlots = ref([])

const isLoading = ref(true)
const isLoadingSlots = ref(false)
const isSubmitting = ref(false)

const successMessage = ref('')
const errorMessage = ref('')

const bookingTypeOptions = [
  {
    value: 'standard',
    label: 'Standard / Casual Booking',
  },
  {
    value: 'tournament',
    label: 'Tournament Match Booking',
  },
]

function getTomorrowDate() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

const myActiveTournaments = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user) {
    return []
  }

  const userId = authStore.userId

  return tournaments.value.filter(
    (tournament) =>
      String(tournament.creatorId) === String(userId) && tournament.status === 'active',
  )
})

const currentSelectedTournament = computed(() => {
  return (
    tournaments.value.find((tournament) => tournament._id === selectedTournamentId.value) || null
  )
})

const minimumBookingDate = computed(() => {
  if (bookingType.value === 'tournament' && currentSelectedTournament.value?.startDate) {
    return currentSelectedTournament.value.startDate
  }

  return getTodayDate()
})

async function loadField() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    field.value = await fetchFieldById(fieldId)

    if (authStore.isAuthenticated) {
      tournaments.value = await fetchTournaments()
    }
  } catch (err) {
    errorMessage.value = err.message || 'Error loading field'
  } finally {
    isLoading.value = false
  }
}

async function loadSlots() {
  if (!fieldId || !selectedDate.value) {
    availableSlots.value = []
    return
  }

  isLoadingSlots.value = true
  selectedSlots.value = []

  try {
    availableSlots.value = await fetchFieldSlots(fieldId, selectedDate.value)
  } catch (err) {
    availableSlots.value = []
    errorMessage.value = err.message || 'Error loading available slots'
  } finally {
    isLoadingSlots.value = false
  }
}

async function handleMultipleBookings() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (selectedSlots.value.length === 0) {
    errorMessage.value = 'Please select at least one time slot'
    return
  }

  if (bookingType.value === 'tournament' && !selectedTournamentId.value) {
    errorMessage.value = 'Please select which tournament this match booking is for'
    return
  }

  isSubmitting.value = true

  const bookingResults = []

  try {
    for (const slot of selectedSlots.value) {
      try {
        await handleBooking(slot)

        bookingResults.push({
          slot,
          success: true,
          error: null,
        })
      } catch (err) {
        bookingResults.push({
          slot,
          success: false,
          error: err.message || 'Booking failed',
        })
      }
    }

    const successfulBookings = bookingResults.filter((result) => result.success)
    const failedBookings = bookingResults.filter((result) => !result.success)

    if (successfulBookings.length > 0) {
      successMessage.value = `Successfully booked: ${successfulBookings
        .map((result) => result.slot)
        .join(', ')}`
    }

    if (failedBookings.length > 0) {
      errorMessage.value = `Failed to book: ${failedBookings
        .map((result) => `${result.slot} (${result.error})`)
        .join(', ')}`
    }

    await loadSlots()

    // Failed slots still selected so they can be retried.
    selectedSlots.value = failedBookings.map((result) => result.slot)
  } finally {
    isSubmitting.value = false
  }
}

async function handleBooking(slot) {
  return await bookFieldSlot(fieldId, {
    date: selectedDate.value,
    slot,
    type: bookingType.value,
    tournamentId: bookingType.value === 'tournament' ? selectedTournamentId.value : null,
  })
}

function goBackToFields() {
  router.push('/fields')
}

function goToTournaments() {
  router.push('/tournaments')
}

watch(bookingType, () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Clear tournament selection when switching back
  // to standard booking.
  if (bookingType.value !== 'tournament') {
    selectedTournamentId.value = ''
    return
  }

  if (myActiveTournaments.value.length > 0 && !selectedTournamentId.value) {
    selectedTournamentId.value = myActiveTournaments.value[0]._id
  }

  const tournament = currentSelectedTournament.value

  if (!tournament?.startDate) {
    return
  }

  const tournamentStartDate = tournament.startDate

  if (selectedDate.value < tournamentStartDate) {
    selectedDate.value = tournamentStartDate
  }
})

watch(selectedTournamentId, () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (bookingType.value !== 'tournament' || !currentSelectedTournament.value?.startDate) {
    return
  }

  const startDate = currentSelectedTournament.value.startDate

  if (selectedDate.value < startDate) {
    selectedDate.value = startDate
  }
})

watch(selectedDate, () => {
  if (field.value) {
    loadSlots()
  }
})

onMounted(async () => {
  await loadField()

  if (field.value) {
    await loadSlots()
  }
})
</script>

<template>
  <div class="field-booking-view">
    <AppBreadcrumbs section="Fields" section-to="/fields" current="Book a Field" />

    <AppBanner v-if="successMessage" type="success" :message="successMessage" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading field...</div>

    <!-- Field not found -->
    <BasePanel v-else-if="!field" title="Field Booking">
      <div class="empty-state">The requested field could not be found.</div>

      <div class="actions-row">
        <BaseButton variant="secondary" @click="goBackToFields"> ← Back to Fields </BaseButton>
      </div>
    </BasePanel>

    <template v-else>
      <BasePanel :title="`Book ${field.name}`">
        <!-- Field summary -->
        <div class="selected-field">
          <div class="field-meta">
            <span>
              <PinPointIcon />
              {{ field.address || 'Main Sports Complex' }}
            </span>

            <span>
              <ClockIcon />
              {{ field.slots?.length || 0 }} Daily Slots
            </span>

            <SportBadge :sport="field.sport" />
          </div>
        </div>

        <!-- Booking type -->
        <div class="type-switcher-container">
          <label class="section-label"> Reservation Purpose: </label>

          <TabSwitcher v-model="bookingType" :options="bookingTypeOptions" />
        </div>

        <!-- TOURNAMENT SECTION -->
        <div v-if="bookingType === 'tournament'" class="tournament-section">
          <div class="section-heading">
            <span class="section-label"> Your active tournaments </span>
          </div>

          <!-- No active tournaments -->
          <div v-if="myActiveTournaments.length === 0" class="tournament-empty">
            <div class="tournament-empty-content">
              <div class="tournament-empty-title">No active tournaments</div>

              <div class="tournament-empty-text">
                Create a tournament, add all teams, and generate the matches before booking a field
                for a tournament match.
              </div>
            </div>

            <div class="quick-actions">
              <BaseButton type="button" variant="secondary" @click="goToTournaments">
                Go to Tournaments
              </BaseButton>
            </div>
          </div>

          <!-- Active tournaments -->
          <div v-else class="tournament-picker">
            <select id="tournament-select" v-model="selectedTournamentId" :disabled="isSubmitting">
              <option
                v-for="tournament in myActiveTournaments"
                :key="tournament._id"
                :value="tournament._id"
              >
                {{ tournament.name }}
                ({{ tournament.sport }}) —
                {{ tournament.teams?.length || 0 }}
                Teams
              </option>
            </select>

            <BaseButton
              type="button"
              variant="secondary"
              :disabled="isSubmitting"
              @click="goToTournaments"
            >
              Manage Tournaments
            </BaseButton>
          </div>
        </div>

        <!-- BOOKING FORM -->
        <form class="booking-form" @submit.prevent="handleMultipleBookings()">
          <!-- Date -->
          <div class="date-section">
            <label class="section-label"> Date: </label>
            <div class="form-group">
              <input
                id="date-select"
                v-model="selectedDate"
                type="date"
                :min="minimumBookingDate"
                :disabled="isSubmitting"
                required
              />
            </div>
          </div>

          <!-- Slots -->
          <div class="slots-section">
            <label class="section-label"> Available Time Slots: </label>

            <div v-if="isLoadingSlots" class="slots-hint">Checking availability...</div>

            <div v-else-if="availableSlots.length === 0" class="slots-hint">
              No slot information available for this date.
            </div>

            <div v-else class="slots-grid">
              <label
                v-for="slotInfo in availableSlots"
                :key="slotInfo.slot"
                :class="[
                  'slot-card',
                  {
                    'slot-selected': selectedSlots.includes(slotInfo.slot),
                    'slot-disabled': !slotInfo.available,
                  },
                ]"
              >
                <input
                  v-model="selectedSlots"
                  type="checkbox"
                  name="slot"
                  :value="slotInfo.slot"
                  :disabled="!slotInfo.available || isSubmitting"
                />

                <span class="slot-time">
                  {{ slotInfo.slot }}
                </span>

                <StatusPill :variant="slotInfo.available ? 'success' : 'danger'">
                  {{ slotInfo.available ? 'Available' : 'Booked' }}
                </StatusPill>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-row">
            <BaseButton
              type="button"
              variant="secondary"
              :disabled="isSubmitting"
              @click="goBackToFields"
            >
              ← Back to Fields
            </BaseButton>

            <BaseButton
              type="submit"
              variant="primary"
              :disabled="
                isSubmitting ||
                selectedSlots.length < 1 ||
                (bookingType === 'tournament' && !selectedTournamentId)
              "
            >
              {{
                isSubmitting
                  ? 'Booking...'
                  : authStore.isAuthenticated
                    ? bookingType === 'tournament'
                      ? 'Confirm Tournament Match Booking'
                      : 'Confirm Standard Booking'
                    : 'Sign In to Book'
              }}
            </BaseButton>
          </div>
        </form>
      </BasePanel>
    </template>
  </div>
</template>

<style scoped>
.field-booking-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.loading-state,
.empty-state {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-danger-banner);
  padding: 32px;
}

/* --------------------------------------------------
   Field summary
-------------------------------------------------- */

.selected-field {
  background: var(--color-white);
  margin-bottom: 25px;
}

.selected-field-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.field-name {
  color: var(--color-black);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.field-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-darkgray);
}

.field-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.field-meta :deep(svg) {
  width: 14px;
  height: 14px;
}

/* --------------------------------------------------
   Booking type
-------------------------------------------------- */

.type-switcher-container {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-black);
}

/* --------------------------------------------------
   Tournament
-------------------------------------------------- */

.tournament-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.section-heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.section-heading .section-label {
  margin-bottom: 0;
}

/* Empty state */

.tournament-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;

  background: rgba(0, 113, 227, 0.04);
  border: 1px solid rgba(0, 113, 227, 0.12);
  border-radius: 12px;
}

.tournament-empty-content {
  min-width: 0;
}

.tournament-empty-title {
  color: var(--color-black);
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.tournament-empty-text {
  color: var(--color-lightgray-text);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Picker */
.tournament-picker {
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 10px;

  transition: border-color 0.15s ease;
}

.tournament-picker:hover {
  border-color: rgba(0, 0, 0, 0.14);
}

.tournament-picker select {
  flex: 1;
  min-width: 0;
  height: 36px;

  padding: 0 32px 0 11px;

  background: var(--color-white);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 7px;

  outline: none;

  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-black);

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.tournament-picker select:hover {
  border-color: rgba(0, 0, 0, 0.18);
}

.tournament-picker select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.1);
}

.tournament-picker select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* --------------------------------------------------
   Form
-------------------------------------------------- */

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

select,
input[type='date'] {
  background: var(--color-white);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-black);
  outline: none;
  transition: all 0.1s ease;
  font-family: inherit;
}

select:focus,
input[type='date']:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

select:disabled,
input[type='date']:disabled {
  background: rgba(0, 0, 0, 0.04);
  color: #8e8e93;
  cursor: not-allowed;
}

/* --------------------------------------------------
   Slots
-------------------------------------------------- */

.slots-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slots-section .section-label {
  margin-bottom: 0;
}

.slots-hint {
  font-size: 13px;
  color: var(--color-lightgray-text);
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.slot-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-white);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;

  transition: 0.1s ease;
}

.slot-card:hover:not(.slot-disabled) {
  border-color: rgba(0, 113, 227, 0.4);
}

.slot-selected {
  border-color: var(--color-primary-dark);
}

.slot-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.02);
}

.slot-time {
  flex: 1;
  font-weight: 600;
}

/* --------------------------------------------------
   Actions
-------------------------------------------------- */

.actions-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

/* --------------------------------------------------
   Responsive
-------------------------------------------------- */

@media (max-width: 650px) {
  .field-meta {
    flex-direction: column;
    gap: 4px;
  }

  .tournament-empty {
    align-items: stretch;
  }

  .tournament-picker {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .tournament-picker select {
    width: 100%;
  }

  .actions-row {
    justify-content: stretch;
  }

  .actions-row :deep(.btn) {
    flex: 1;
  }

  .slots-grid {
    grid-template-columns: 1fr;
  }
}
</style>
