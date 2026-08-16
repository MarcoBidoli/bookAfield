<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchFields, fetchFieldSlots, bookFieldSlot } from '@/api/fields'
import { fetchTournaments } from '@/api/tournaments'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State
const fields = ref([])
const tournaments = ref([])
const searchQuery = ref('')
const selectedFieldId = ref('')
const selectedDate = ref(getTomorrowDate())
const availableSlots = ref([])
const selectedSlot = ref('')

// Booking Type: 'standard' | 'tournament'
const bookingType = ref('standard')
const selectedTournamentId = ref('')

const isLoadingFields = ref(false)
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
  if (!authStore.isAuthenticated || !authStore.user) return []
  const userId = authStore.user._id || authStore.user.id
  return tournaments.value.filter(
    t => String(t.creatorId) === String(userId) && t.status === 'active'
  )
})

// Selected tournament object
const currentSelectedTournament = computed(() => {
  if (!selectedTournamentId.value) return null
  return tournaments.value.find(t => t._id === selectedTournamentId.value) || null
})

// Filtered fields: when tournament booking is selected, only show fields matching tournament sport
const displayedFields = computed(() => {
  if (bookingType.value === 'tournament' && currentSelectedTournament.value) {
    return fields.value.filter(
      f => f.sport?.toLowerCase() === currentSelectedTournament.value.sport?.toLowerCase()
    )
  }
  return fields.value
})

async function loadData() {
  isLoadingFields.value = true
  errorMessage.value = ''
  try {
    const [fieldsData, tournamentsData] = await Promise.all([
      fetchFields(searchQuery.value),
      fetchTournaments()
    ])
    fields.value = fieldsData
    tournaments.value = tournamentsData

    // Check URL query parameters (e.g. redirected from matches: ?tournamentId=...&sport=...)
    if (route.query.tournamentId) {
      bookingType.value = 'tournament'
      selectedTournamentId.value = route.query.tournamentId
    }

    if (displayedFields.value.length > 0 && !selectedFieldId.value) {
      selectedFieldId.value = displayedFields.value[0]._id
    }
  } catch (err) {
    errorMessage.value = err.message || 'Error loading data'
  } finally {
    isLoadingFields.value = false
  }
}

async function loadSlots() {
  if (!selectedFieldId.value || !selectedDate.value) {
    availableSlots.value = []
    return
  }

  isLoadingSlots.value = true
  selectedSlot.value = ''
  try {
    availableSlots.value = await fetchFieldSlots(selectedFieldId.value, selectedDate.value)
  } catch (err) {
    availableSlots.value = []
    errorMessage.value = err.message || 'Error loading slots'
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
    // Calls POST /api/fields/:id/bookings with date, slot, type
    await bookFieldSlot(selectedFieldId.value, {
      date: selectedDate.value,
      slot: selectedSlot.value,
      type: bookingType.value === 'tournament' ? 'tournament' : 'standard',
      tournamentId: bookingType.value === 'tournament' ? selectedTournamentId.value : null
    })

    successMessage.value = `Successfully booked slot ${selectedSlot.value} on ${selectedDate.value} (${bookingType.value} reservation)!`
    selectedSlot.value = ''
    await loadSlots()
  } catch (err) {
    errorMessage.value = err.message || 'Booking failed'
  } finally {
    isSubmitting.value = false
  }
}

function selectField(id) {
  selectedFieldId.value = id
  successMessage.value = ''
  errorMessage.value = ''
}

// Watchers
watch(selectedFieldId, () => {
  if (selectedFieldId.value) {
    loadSlots()
  }
})

watch(selectedDate, () => {
  if (selectedFieldId.value) {
    loadSlots()
  }
})

watch(bookingType, () => {
  if (bookingType.value === 'tournament') {
    if (myActiveTournaments.value.length > 0 && !selectedTournamentId.value) {
      selectedTournamentId.value = myActiveTournaments.value[0]._id
    }
  }
  // Auto-select first matching field
  if (displayedFields.value.length > 0) {
    selectedFieldId.value = displayedFields.value[0]._id
  }
})

watch(selectedTournamentId, () => {
  if (displayedFields.value.length > 0) {
    selectedFieldId.value = displayedFields.value[0]._id
  }
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="fields-view">
    <!-- Feedback Messages -->
    <div v-if="successMessage" class="banner success-banner">
      ✓ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="banner error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Booking Form Panel -->
    <AquaPanel title="Book a Sports Field">
      <!-- Booking Type Segmented Switcher -->
      <div class="type-switcher-container">
        <label class="section-label">Reservation Purpose:</label>
        <div class="segmented-control">
          <button
            type="button"
            :class="['tab-btn', { active: bookingType === 'standard' }]"
            @click="bookingType = 'standard'"
          >
            Standard / Casual Booking
          </button>
          <button
            type="button"
            :class="['tab-btn', { active: bookingType === 'tournament' }]"
            @click="bookingType = 'tournament'"
          >
            Tournament Match Booking
          </button>
        </div>
      </div>

      <!-- Tournament Selector (Visible when Tournament Match mode is active) -->
      <div v-if="bookingType === 'tournament'" class="tournament-select-box">
        <label for="tournament-select">Select Your Active Tournament:</label>
        <div v-if="myActiveTournaments.length === 0" class="no-tournaments-warn">
          You have no active tournaments created. You can create one in the <router-link to="/tournaments">Tournaments</router-link> tab.
        </div>
        <select
          v-else
          id="tournament-select"
          v-model="selectedTournamentId"
        >
          <option
            v-for="t in myActiveTournaments"
            :key="t._id"
            :value="t._id"
          >
            {{ t.name }} ({{ t.sport }}) — {{ t.teams?.length || 0 }} Teams
          </option>
        </select>
      </div>

      <form @submit.prevent="handleBooking" class="booking-form">
        <div class="form-grid">
          <!-- Field Selector -->
          <div class="form-group">
            <label for="field-select">
              Field ({{ bookingType === 'tournament' && currentSelectedTournament ? `${currentSelectedTournament.sport} only` : 'All Sports' }}):
            </label>
            <select
              id="field-select"
              v-model="selectedFieldId"
              :disabled="isLoadingFields || displayedFields.length === 0"
            >
              <option v-if="displayedFields.length === 0" value="" disabled>
                {{ isLoadingFields ? 'Loading fields...' : 'No fields found matching sport' }}
              </option>
              <option
                v-for="field in displayedFields"
                :key="field._id"
                :value="field._id"
              >
                {{ field.name }} ({{ field.sport }}) — {{ field.address || 'Main Complex' }}
              </option>
            </select>
          </div>

          <!-- Date Selector -->
          <div class="form-group">
            <label for="date-select">Date:</label>
            <input
              id="date-select"
              v-model="selectedDate"
              type="date"
              :min="getTodayDate()"
              required
            />
          </div>
        </div>

        <!-- Time Slot Selection -->
        <div class="slots-section">
          <label class="section-label">Available Time Slots:</label>

          <div v-if="isLoadingSlots" class="slots-hint">
            Checking availability...
          </div>

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
                  'slot-disabled': !slotInfo.available
                }
              ]"
            >
              <input
                type="radio"
                name="slot"
                :value="slotInfo.slot"
                :disabled="!slotInfo.available"
                v-model="selectedSlot"
              />
              <span class="slot-time">{{ slotInfo.slot }}</span>
              <span :class="['slot-status', slotInfo.available ? 'status-free' : 'status-booked']">
                {{ slotInfo.available ? 'Available' : 'Booked' }}
              </span>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="actions-row">
          <AquaButton
            type="submit"
            :disabled="isSubmitting || !selectedSlot || (bookingType === 'tournament' && !selectedTournamentId)"
          >
            {{ isSubmitting ? 'Booking...' : (authStore.isAuthenticated ? (bookingType === 'tournament' ? 'Confirm Tournament Match Booking' : 'Confirm Standard Booking') : 'Sign In to Book') }}
          </AquaButton>
        </div>
      </form>
    </AquaPanel>

    <!-- Available Fields Directory -->
    <AquaPanel title="Fields Directory">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-pill"
          placeholder="Filter fields by name or address..."
          @input="loadData"
        />
      </div>

      <div v-if="isLoadingFields" class="empty-state">
        Loading directory...
      </div>

      <div v-else-if="displayedFields.length === 0" class="empty-state">
        No sports fields match your criteria.
      </div>

      <div v-else class="field-list">
        <div
          v-for="field in displayedFields"
          :key="field._id"
          :class="['field-item', { active: selectedFieldId === field._id }]"
          @click="selectField(field._id)"
        >
          <div class="field-header">
            <span class="field-name">{{ field.name }}</span>
            <span class="field-sport-badge">{{ field.sport }}</span>
          </div>
          <div class="field-meta">
            <span>📍 {{ field.address || 'Main Sports Complex' }}</span>
            <span>⏱ {{ field.slots ? field.slots.length : 0 }} Daily Slots</span>
          </div>
        </div>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.fields-view {
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

.type-switcher-container {
  margin-bottom: 12px;
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

.tournament-select-box {
  background: #fff;
  border: 1px solid #c0d4ec;
  padding: 10px 12px;
  border-radius: 5px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.no-tournaments-warn {
  font-size: 11px;
  color: #a05000;
  font-style: italic;
}

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

label, .section-label {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

select, input[type="date"], input[type="text"] {
  background: #ffffff;
  border: 1px solid #8e8e8e;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 12px;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

select:focus, input[type="date"]:focus, input[type="text"]:focus {
  border-color: #38a5e8;
  box-shadow: 0 0 5px #70c3ff, inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

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

.actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.search-bar {
  margin-bottom: 12px;
}

.search-pill {
  width: 100%;
  border-radius: 14px !important;
  padding-left: 26px !important;
  background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") 8px center no-repeat !important;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.field-item:hover {
  border-color: #38a5e8;
}

.field-item.active {
  border-color: #1a62d6;
  background: #f4f8fe;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.field-name {
  color: #0044bb;
  font-weight: bold;
  font-size: 13px;
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
  font-size: 11px;
  color: #666;
}

.empty-state, .slots-hint {
  font-size: 12px;
  color: #666;
  padding: 8px 0;
}
</style>
