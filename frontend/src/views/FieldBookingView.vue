<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { bookFieldSlot, fetchFieldById, fetchFieldSlots } from '@/api/fields'
import { fetchTournaments } from '@/api/tournaments'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import SportBadge from '@/components/SportBadge.vue'
import Switcher from '@/components/Switcher.vue'
import Pill from '@/components/Pill.vue'
import DateStrip from '@/components/DateStrip.vue'

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

const selectedDate = ref(getTomorrowDateAsDate())

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

/* --------------------------------------------------
   Dates
-------------------------------------------------- */

function getTodayDate() {
  return formatDate(new Date())
}

function getTomorrowDateAsDate() {
  const date = new Date()

  date.setDate(date.getDate() + 1)
  date.setHours(0, 0, 0, 0)

  return date
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDate(dateString) {
  if (!dateString) {
    return new Date()
  }

  if (dateString instanceof Date) {
    return new Date(dateString)
  }

  // Safely handle both ISO strings and standard YYYY-MM-DD
  const cleanDateStr = String(dateString).split('T')[0]
  const [year, month, day] = cleanDateStr.split('-')

  return new Date(Number(year), Number(month) - 1, Number(day))
}

/* --------------------------------------------------
   Computed
-------------------------------------------------- */

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

const minimumBookingDateObject = computed(() => {
  return parseDate(minimumBookingDate.value)
})

/* --------------------------------------------------
   Field
-------------------------------------------------- */

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

/* --------------------------------------------------
   Slots
-------------------------------------------------- */

async function loadSlots() {
  if (!fieldId || !selectedDate.value) {
    availableSlots.value = []
    return
  }

  isLoadingSlots.value = true
  selectedSlot.value = ''

  try {
    availableSlots.value = await fetchFieldSlots(fieldId, formatDate(selectedDate.value))
  } catch (err) {
    availableSlots.value = []
    errorMessage.value = err.message || 'Error loading available slots'
  } finally {
    isLoadingSlots.value = false
  }
}

/* --------------------------------------------------
   Booking
-------------------------------------------------- */

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
      date: formatDate(selectedDate.value),
      slot: selectedSlot.value,
      type: bookingType.value,
      tournamentId: bookingType.value === 'tournament' ? selectedTournamentId.value : null,
    })

    successMessage.value =
      `Successfully booked ${field.value.name} for ` +
      `${formatDate(selectedDate.value)} at ` +
      `${selectedSlot.value}.`

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

function goToTournaments() {
  router.push('/tournaments')
}

/* --------------------------------------------------
   Date selection
-------------------------------------------------- */

watch(selectedDate, async (newDate, oldDate) => {
  if (!newDate || !field.value) {
    return
  }

  if (oldDate && formatDate(newDate) === formatDate(oldDate)) {
    return
  }

  errorMessage.value = ''
  successMessage.value = ''

  await loadSlots()
})

/* --------------------------------------------------
   Booking type
-------------------------------------------------- */

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

  const tournamentStartDate = parseDate(tournament.startDate)

  if (selectedDate.value < tournamentStartDate) {
    selectedDate.value = tournamentStartDate
  }
})

/* --------------------------------------------------
   Tournament selection
-------------------------------------------------- */

watch(selectedTournamentId, () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (bookingType.value !== 'tournament' || !currentSelectedTournament.value?.startDate) {
    return
  }

  const startDate = parseDate(currentSelectedTournament.value.startDate)

  if (selectedDate.value < startDate) {
    selectedDate.value = startDate
  }
})

/* --------------------------------------------------
   Initial load
-------------------------------------------------- */

onMounted(async () => {
  await loadField()

  if (field.value) {
    await loadSlots()
  }
})
</script>

<template>
  <div class="field-booking-view">
    <Breadcrumbs section="Fields" section-to="/fields" current="Book a Field" />

    <AppBanner v-if="successMessage" type="success" :message="successMessage" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">Loading field...</div>

    <!-- Field not found -->
    <Panel v-else-if="!field" title="Field Booking">
      <div class="empty-state">The requested field could not be found.</div>

      <div class="actions-row">
        <Button variant="secondary" @click="goBackToFields"> ← Back to Fields </Button>
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
              {{ field.slots?.length || 0 }}
              Daily Slots
            </span>
          </div>
        </div>

        <!-- Booking type -->
        <div class="type-switcher-container">
          <label class="section-label"> Reservation Purpose: </label>

          <Switcher v-model="bookingType" :options="bookingTypeOptions" />
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
              <Button type="button" variant="secondary" @click="goToTournaments">
                Go to Tournaments
              </Button>
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

            <Button
              type="button"
              variant="secondary"
              :disabled="isSubmitting"
              @click="goToTournaments"
            >
              Manage Tournaments
            </Button>
          </div>
        </div>

        <!-- ==================================================
             BOOKING FORM
             ================================================== -->
        <form class="booking-form" @submit.prevent="handleBooking">
          <!-- Date -->
          <div class="date-section">
            <label class="section-label"> Date: </label>

            <DateStrip v-model="selectedDate" :min-date="minimumBookingDateObject" />
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

                <Pill :variant="slotInfo.available ? 'success' : 'danger'">
                  {{ slotInfo.available ? 'Available' : 'Booked' }}
                </Pill>
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
  color: var(--color-danger-banner);
  padding: 32px;
}

/* --------------------------------------------------
   Field summary
-------------------------------------------------- */

.selected-field {
  background: var(--color-white);
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

  padding: 14px 16px;

  background: rgba(0, 0, 0, 0.025);
  border: 1px solid rgba(0, 0, 0, 0.08);
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

  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
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
