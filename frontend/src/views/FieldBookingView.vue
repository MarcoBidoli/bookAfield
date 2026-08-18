<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { fetchFieldById, fetchFieldSlots, bookFieldSlot } from '@/api/fields'
import { fetchTournaments } from '@/api/tournaments'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import SportBadge from '@/components/SportBadge.vue'
import Switcher from '@/components/Switcher.vue'

import ClockIcon from '@/components/icons/ClockIcon.vue'
import PinPointIcon from '@/components/icons/PinPointIcon.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const fieldId = route.params.id

const field = ref(null)
const tournaments = ref([])

const bookingType = ref('standard')
const selectedTournamentId = ref('')

const selectedDate = ref(getTomorrowDate())
const availableSlots = ref([])
const selectedSlot = ref('')

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

  const userId = authStore.user._id || authStore.user.id

  return tournaments.value.filter(
    (tournament) =>
      String(tournament.creatorId) === String(userId) &&
      tournament.status === 'active',
  )
})

const currentSelectedTournament = computed(() => {
  return (
    tournaments.value.find(
      (tournament) => tournament._id === selectedTournamentId.value,
    ) || null
  )
})

const minimumBookingDate = computed(() => {
  if (
    bookingType.value === 'tournament' &&
    currentSelectedTournament.value?.startDate
  ) {
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
  selectedSlot.value = ''

  try {
    availableSlots.value = await fetchFieldSlots(
      fieldId,
      selectedDate.value,
    )
  } catch (err) {
    availableSlots.value = []
    errorMessage.value =
      err.message || 'Error loading available slots'
  } finally {
    isLoadingSlots.value = false
  }
}

async function handleBooking() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!selectedSlot.value) {
    errorMessage.value = 'Please select a time slot'
    return
  }

  if (
    bookingType.value === 'tournament' &&
    !selectedTournamentId.value
  ) {
    errorMessage.value =
      'Please select which tournament this match booking is for'
    return
  }

  isSubmitting.value = true

  try {
    await bookFieldSlot(fieldId, {
      date: selectedDate.value,
      slot: selectedSlot.value,
      type: bookingType.value,
      tournamentId:
        bookingType.value === 'tournament'
          ? selectedTournamentId.value
          : null,
    })

    successMessage.value =
      `Successfully booked ${field.value.name} for ` +
      `${selectedDate.value} at ${selectedSlot.value}.`

    await loadSlots()
  } catch (err) {
    errorMessage.value = err.message || 'Booking failed'
  } finally {
    isSubmitting.value = false
  }
}

function goBackToFields() {
  router.push('/fields')
}

watch(bookingType, () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (bookingType.value !== 'tournament') {
    return
  }

  if (
    myActiveTournaments.value.length > 0 &&
    !selectedTournamentId.value
  ) {
    selectedTournamentId.value =
      myActiveTournaments.value[0]._id
  }

  const tournament = currentSelectedTournament.value

  if (
    tournament?.startDate &&
    selectedDate.value < tournament.startDate
  ) {
    selectedDate.value = tournament.startDate
  }
})

watch(selectedTournamentId, () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (
    bookingType.value !== 'tournament' ||
    !currentSelectedTournament.value?.startDate
  ) {
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
    <Breadcrumbs
      section="Fields"
      section-to="/fields"
      current="Book a Field"
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

    <div v-if="isLoading" class="loading-state">
      Loading field...
    </div>

    <Panel v-else-if="!field" title="Field Booking">
      <div class="empty-state">
        The requested field could not be found.
      </div>

      <div class="actions-row">
        <Button variant="secondary" @click="goBackToFields">
          ← Back to Fields
        </Button>
      </div>
    </Panel>

    <template v-else>
      <Panel :title="`Book ${field.name}`">
        <!-- Field summary -->
        <div class="selected-field">
          <div class="selected-field-main">
            <span class="field-name">
              {{ field.name }}
            </span>

            <SportBadge :sport="field.sport" />
          </div>

          <div class="field-meta">
            <span>
              <PinPointIcon />
              {{ field.address || 'Main Sports Complex' }}
            </span>

            <span>
              <ClockIcon />
              {{ field.slots?.length || 0 }} Daily Slots
            </span>
          </div>
        </div>

        <!-- Booking type -->
        <div class="type-switcher-container">
          <label class="section-label">
            Reservation Purpose:
          </label>

          <Switcher
            v-model="bookingType"
            :options="bookingTypeOptions"
          />
        </div>

        <!-- Tournament -->
        <div
          v-if="bookingType === 'tournament'"
          class="tournament-select-box"
        >
          <label for="tournament-select">
            Select Your Active Tournament:
          </label>

          <div
            v-if="myActiveTournaments.length === 0"
            class="no-tournaments-warn"
          >
            You have no active tournaments created.
            <router-link to="/tournaments">
              Create or manage a tournament
            </router-link>.
          </div>

          <select
            v-else
            id="tournament-select"
            v-model="selectedTournamentId"
            :disabled="isSubmitting"
          >
            <option
              v-for="tournament in myActiveTournaments"
              :key="tournament._id"
              :value="tournament._id"
            >
              {{ tournament.name }}
              ({{ tournament.sport }}) —
              {{ tournament.teams?.length || 0 }} Teams
            </option>
          </select>
        </div>

        <!-- Booking -->
        <form
          class="booking-form"
          @submit.prevent="handleBooking"
        >
          <div class="form-group">
            <label for="date-select">Date:</label>

            <input
              id="date-select"
              v-model="selectedDate"
              type="date"
              :min="minimumBookingDate"
              :disabled="isSubmitting"
              required
            />
          </div>

          <!-- Slots -->
          <div class="slots-section">
            <label class="section-label">
              Available Time Slots:
            </label>

            <div v-if="isLoadingSlots" class="slots-hint">
              Checking availability...
            </div>

            <div
              v-else-if="availableSlots.length === 0"
              class="slots-hint"
            >
              No slot information available for this date.
            </div>

            <div v-else class="slots-grid">
              <label
                v-for="slotInfo in availableSlots"
                :key="slotInfo.slot"
                :class="[
                  'slot-card',
                  {
                    'slot-selected':
                      selectedSlot === slotInfo.slot,
                    'slot-disabled':
                      !slotInfo.available,
                  },
                ]"
              >
                <input
                  v-model="selectedSlot"
                  type="radio"
                  name="slot"
                  :value="slotInfo.slot"
                  :disabled="
                    !slotInfo.available || isSubmitting
                  "
                />

                <span class="slot-time">
                  {{ slotInfo.slot }}
                </span>

                <span
                  :class="[
                    'slot-status',
                    slotInfo.available
                      ? 'status-free'
                      : 'status-booked',
                  ]"
                >
                  {{
                    slotInfo.available
                      ? 'Available'
                      : 'Booked'
                  }}
                </span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-row">
            <Button
              type="button"
              variant="secondary"
              :disabled="isSubmitting"
              @click="goBackToFields"
            >
              ← Back to Fields
            </Button>

            <Button
              type="submit"
              variant="primary"
              :disabled="
                isSubmitting ||
                !selectedSlot ||
                (bookingType === 'tournament' &&
                  !selectedTournamentId)
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
            </Button>
          </div>
        </form>
      </Panel>
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
  color: #6e6e73;
  padding: 32px;
}

/* Field summary */
.selected-field {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.selected-field-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.field-name {
  color: #111113;
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
  color: #6e6e73;
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

/* Booking type */
.type-switcher-container {
  margin-bottom: 20px;
}

.section-label,
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #111113;
}

/* Tournament */
.tournament-select-box {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.tournament-select-box label {
  font-size: 13px;
  font-weight: 700;
  color: #111113;
}

.no-tournaments-warn {
  font-size: 12px;
  font-weight: 600;
  color: #b71c1c;
}

.no-tournaments-warn a {
  color: #0071e3;
  font-weight: 700;
}

/* Form */
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
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #111113;
  outline: none;
  transition: all 0.1s ease;
}

select:focus,
input[type='date']:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

select:disabled,
input[type='date']:disabled {
  background: rgba(0, 0, 0, 0.04);
  color: #8e8e93;
  cursor: not-allowed;
}

/* Slots */
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
  color: #6e6e73;
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
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.1s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.slot-card:hover:not(.slot-disabled) {
  border-color: rgba(0, 113, 227, 0.4);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.08);
}

.slot-selected {
  border-color: #0071e3 !important;
  background: rgba(0, 113, 227, 0.04) !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.1) !important;
}

.slot-disabled {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.06);
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.slot-time {
  flex-grow: 1;
  color: #111113;
  font-weight: 600;
}

.slot-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 980px;
}

.status-free {
  background: rgba(52, 199, 89, 0.12);
  color: #1b5e20;
  border: 1px solid rgba(52, 199, 89, 0.25);
}

.status-booked {
  background: rgba(255, 59, 48, 0.12);
  color: #b71c1c;
  border: 1px solid rgba(255, 59, 48, 0.25);
}

/* Actions */
.actions-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

@media (max-width: 650px) {
  .field-meta {
    flex-direction: column;
    gap: 4px;
  }

  .actions-row {
    justify-content: stretch;
  }

  .actions-row :deep(.btn) {
    flex: 1;
  }
}
</style>
