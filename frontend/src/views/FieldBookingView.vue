<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { fetchFieldById, fetchFieldSlots, bookFieldSlot } from '@/api/fields'

import { fetchTournaments } from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const fieldId = route.params.id

// Field
const field = ref(null)

// Tournaments
const tournaments = ref([])
const bookingType = ref('standard')
const selectedTournamentId = ref('')

// Booking
const selectedDate = ref(getTomorrowDate())
const availableSlots = ref([])
const selectedSlot = ref('')

// State
const isLoading = ref(true)
const isLoadingSlots = ref(false)
const isSubmitting = ref(false)

const successMessage = ref('')
const errorMessage = ref('')

function getTomorrowDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

// User's active tournaments where they are creator
const myActiveTournaments = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user) {
    return []
  }

  const userId = authStore.user._id || authStore.user.id

  return tournaments.value.filter(
    (tournament) =>
      String(tournament.creatorId) === String(userId) && tournament.status === 'active',
  )
})

// Currently selected tournament
const currentSelectedTournament = computed(() => {
  if (!selectedTournamentId.value) {
    return null
  }

  return (
    tournaments.value.find((tournament) => tournament._id === selectedTournamentId.value) || null
  )
})

// Tournament bookings cannot be before tournament start
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
    const fieldData = await fetchFieldById(fieldId)

    field.value = fieldData

    // Tournaments are only needed for authenticated users
    // because only tournament creators can make tournament bookings.
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
    availableSlots.value = await fetchFieldSlots(fieldId, selectedDate.value)
  } catch (err) {
    availableSlots.value = []
    errorMessage.value = err.message || 'Error loading available slots'
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

  if (bookingType.value === 'tournament' && !selectedTournamentId.value) {
    errorMessage.value = 'Please select which tournament this match booking is for'
    return
  }

  isSubmitting.value = true

  try {
    await bookFieldSlot(fieldId, {
      date: selectedDate.value,
      slot: selectedSlot.value,
      type: bookingType.value === 'tournament' ? 'tournament' : 'standard',
      tournamentId: bookingType.value === 'tournament' ? selectedTournamentId.value : null,
    })

    successMessage.value =
      `Successfully booked ${field.value.name} for ` +
      `${selectedDate.value} at ${selectedSlot.value}.`

    selectedSlot.value = ''

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

// When changing booking type
watch(bookingType, () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (bookingType.value === 'tournament') {
    if (myActiveTournaments.value.length > 0 && !selectedTournamentId.value) {
      selectedTournamentId.value = myActiveTournaments.value[0]._id
    }

    const tournament = currentSelectedTournament.value

    if (tournament?.startDate && selectedDate.value < tournament.startDate) {
      selectedDate.value = tournament.startDate
    }
  }
})

// When changing tournament
watch(selectedTournamentId, () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (bookingType.value === 'tournament' && currentSelectedTournament.value?.startDate) {
    const tournamentStart = currentSelectedTournament.value.startDate

    if (selectedDate.value < tournamentStart) {
      selectedDate.value = tournamentStart
    }
  }
})

// Reload slots when date changes
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
    <!-- Breadcrumb -->
    <Breadcrumbs section="Fields" section-to="/fields" current="Book a Field" />

    <!-- Feedback -->
    <div v-if="successMessage" class="banner success-banner">✓ {{ successMessage }}</div>

    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading field...</div>

    <!-- Field not found -->
    <AquaPanel v-else-if="!field" title="Field Booking">
      <div class="empty-state">The requested field could not be found.</div>

      <div class="actions-row">
        <AquaButton variant="secondary" @click="goBackToFields"> ← Back to Fields </AquaButton>
      </div>
    </AquaPanel>

    <!-- Booking -->
    <template v-else>
      <AquaPanel :title="`Book ${field.name}`">
        <!-- Selected field -->
        <div class="selected-field">
          <div class="selected-field-main">
            <span class="field-name">
              {{ field.name }}
            </span>

            <span class="field-sport-badge">
              {{ field.sport }}
            </span>
          </div>

          <div class="field-meta">
            <span> 📍 {{ field.address || 'Main Sports Complex' }} </span>

            <span> ⏱ {{ field.slots?.length || 0 }} Daily Slots </span>
          </div>
        </div>

        <!-- Booking type -->
        <div class="type-switcher-container">
          <label class="section-label"> Reservation Purpose: </label>

          <div class="segmented-control">
            <button
              type="button"
              :class="[
                'tab-btn',
                {
                  active: bookingType === 'standard',
                },
              ]"
              @click="bookingType = 'standard'"
            >
              Standard / Casual Booking
            </button>

            <button
              type="button"
              :class="[
                'tab-btn',
                {
                  active: bookingType === 'tournament',
                },
              ]"
              @click="bookingType = 'tournament'"
            >
              Tournament Match Booking
            </button>
          </div>
        </div>

        <!-- Tournament -->
        <div v-if="bookingType === 'tournament'" class="tournament-select-box">
          <label for="tournament-select"> Select Your Active Tournament: </label>

          <div v-if="myActiveTournaments.length === 0" class="no-tournaments-warn">
            You have no active tournaments created.

            <router-link to="/tournaments"> Create or manage a tournament </router-link>
            .
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
              ({{ tournament.sport }}) — {{ tournament.teams?.length || 0 }} Teams
            </option>
          </select>
        </div>

        <!-- Date -->
        <form class="booking-form" @submit.prevent="handleBooking">
          <div class="form-grid">
            <div class="form-group">
              <label for="date-select"> Date: </label>

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
                    'slot-selected': selectedSlot === slotInfo.slot,

                    'slot-disabled': !slotInfo.available,
                  },
                ]"
              >
                <input
                  v-model="selectedSlot"
                  type="radio"
                  name="slot"
                  :value="slotInfo.slot"
                  :disabled="!slotInfo.available || isSubmitting"
                />

                <span class="slot-time">
                  {{ slotInfo.slot }}
                </span>

                <span
                  :class="['slot-status', slotInfo.available ? 'status-free' : 'status-booked']"
                >
                  {{ slotInfo.available ? 'Available' : 'Booked' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-row">
            <AquaButton
              type="button"
              variant="secondary"
              :disabled="isSubmitting"
              @click="goBackToFields"
            >
              ← Back to Fields
            </AquaButton>

            <AquaButton
              type="submit"
              variant="primary"
              :disabled="
                isSubmitting ||
                !selectedSlot ||
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
            </AquaButton>
          </div>
        </form>
      </AquaPanel>
    </template>
  </div>
</template>

<style scoped>
.field-booking-view {
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

.loading-state,
.empty-state {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 16px;
}

/* Selected field */

.selected-field {
  background: #f4f8fe;
  border: 1px solid #c0d4ec;
  border-radius: 5px;
  padding: 10px 12px;
  margin-bottom: 14px;
}

.selected-field-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.field-name {
  color: #0044bb;
  font-size: 13px;
  font-weight: bold;
}

.field-sport-badge {
  background: linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%);
  border: 1px solid #b2b2b2;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: bold;
  text-transform: capitalize;
}

.field-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #666;
}

/* Booking type */

.type-switcher-container {
  margin-bottom: 14px;
}

.section-label,
.form-group label {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

.segmented-control {
  display: flex;
  background: #d8d8d8;
  border-radius: 6px;
  padding: 2px;
  margin-top: 4px;
  border: 1px solid #b2b2b2;
  max-width: 420px;
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: bold;
  color: #555;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn.active {
  background: linear-gradient(180deg, #ffffff 0%, #e2e2e2 100%);
  color: #111;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tab-btn:hover:not(.active) {
  background: #c8c8c8;
}

/* Tournament */

.tournament-select-box {
  background: #fff;
  border: 1px solid #c0d4ec;
  padding: 10px 12px;
  border-radius: 5px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tournament-select-box label {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

.no-tournaments-warn {
  font-size: 11px;
  color: #a05000;
  font-style: italic;
}

.no-tournaments-warn a {
  color: #0044bb;
  font-style: normal;
  font-weight: bold;
}

/* Form */

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

select,
input[type='date'] {
  background: #ffffff;
  border: 1px solid #8e8e8e;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 12px;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

select:focus,
input[type='date']:focus {
  border-color: #38a5e8;
  box-shadow:
    0 0 5px #70c3ff,
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

select:disabled,
input[type='date']:disabled {
  background: #f2f2f2;
  color: #777;
}

/* Slots */

.slots-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 8px;
}

.slot-card {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #ccc;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.slot-card:hover:not(.slot-disabled) {
  border-color: #38a5e8;
  background-color: #f2f8fc;
}

.slot-selected {
  border-color: #1a62d6 !important;
  background-color: #e9f2ff !important;
  font-weight: bold;
}

.slot-disabled {
  background: #eaeaea;
  border-color: #d0d0d0;
  opacity: 0.6;
  cursor: not-allowed;
}

.slot-time {
  flex-grow: 1;
}

.slot-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.status-free {
  background: #d4edda;
  color: #155724;
}

.status-booked {
  background: #f8d7da;
  color: #721c24;
}

/* Actions */

.actions-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

@media (max-width: 650px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .segmented-control {
    max-width: none;
    flex-direction: column;
  }

  .field-meta {
    flex-direction: column;
    gap: 4px;
  }

  .actions-row {
    justify-content: stretch;
  }

  .actions-row :deep(.aqua-btn) {
    flex: 1;
  }
}
</style>
