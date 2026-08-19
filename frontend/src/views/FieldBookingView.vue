<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'

import {bookFieldSlot, fetchFieldById, fetchFieldSlots,} from '@/api/fields'
import {fetchTournaments} from '@/api/tournaments'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import SportBadge from '@/components/SportBadge.vue'
import Switcher from '@/components/Switcher.vue'
import Pill from '@/components/Pill.vue'

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
      (tournament) =>
        tournament._id === selectedTournamentId.value,
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
    errorMessage.value =
      err.message || 'Error loading field'
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

  const startDate =
    currentSelectedTournament.value.startDate

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

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="loading-state"
    >
      Loading field...
    </div>

    <!-- Field not found -->
    <Panel
      v-else-if="!field"
      title="Field Booking"
    >
      <div class="empty-state">
        The requested field could not be found.
      </div>

      <div class="actions-row">
        <Button
          variant="secondary"
          @click="goBackToFields"
        >
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
          class="tournament-section"
        >
          <div class="section-heading">
            <span class="section-label">
              Tournament
            </span>

            <span class="section-hint">
              Select the tournament for this match
            </span>
          </div>

          <!-- No tournaments -->
          <div
            v-if="myActiveTournaments.length === 0"
            class="tournament-empty"
          >
            <div class="tournament-empty-content">
              <div class="tournament-empty-title">
                No active tournaments
              </div>

              <div class="tournament-empty-text">
                Create a tournament, add all teams, and generate the matches before booking a field for a tournament match.
              </div>
            </div>

            <div class="quick-actions">
              <router-link to="/tournaments">
                <Button variant="secondary">
                  Go to Tournaments
                </Button>
              </router-link>
            </div>
          </div>

          <!-- Tournaments available -->
          <div
            v-else
            class="tournament-picker"
          >
            <label for="tournament-select">
              Your Active Tournaments
            </label>

            <select
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

            <router-link
              to="/tournaments"
              class="manage-tournaments"
            >
              Manage tournaments
            </router-link>
          </div>
        </div>

        <!-- Booking -->
        <form
          class="booking-form"
          @submit.prevent="handleBooking"
        >
          <!-- Date -->
          <div class="form-group">
            <label for="date-select">
              Date:
            </label>

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

            <div
              v-if="isLoadingSlots"
              class="slots-hint"
            >
              Checking availability...
            </div>

            <div
              v-else-if="availableSlots.length === 0"
              class="slots-hint"
            >
              No slot information available for this date.
            </div>

            <div
              v-else
              class="slots-grid"
            >
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
                    !slotInfo.available ||
                    isSubmitting
                  "
                />

                <span class="slot-time">
                  {{ slotInfo.slot }}
                </span>

                <Pill
                  :variant="
                    slotInfo.available
                      ? 'success'
                      : 'danger'
                  "
                >
                  {{
                    slotInfo.available
                      ? 'Available'
                      : 'Booked'
                  }}
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

.section-label,
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-black);
}

.form-group label {
  margin-bottom: 0;
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

.section-hint {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-lightgray-text);
}

/* Empty tournament state */

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

/* Buttons under explanation */

.quick-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-actions a {
  text-decoration: none;
}

/* Tournament picker */

.tournament-picker {
  display: flex;
  align-items: center;
  gap: 12px;

  background: var(--color-white);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px 16px;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.tournament-picker label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-black);
  white-space: nowrap;
}

.tournament-picker select {
  flex: 1;
  min-width: 0;
}

.manage-tournaments {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.manage-tournaments:hover {
  text-decoration: underline;
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
  grid-template-columns: repeat(
    auto-fill,
    minmax(200px, 1fr)
  );
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
  background: rgba(0, 113, 227, 0.04);
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

  .quick-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .quick-actions a {
    width: 100%;
  }

  .quick-actions :deep(.btn) {
    width: 100%;
  }

  .tournament-picker {
    align-items: stretch;
    flex-direction: column;
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
