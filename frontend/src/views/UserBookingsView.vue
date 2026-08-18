<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchUserBookings, cancelBooking } from '@/api/fields'

import AquaPanel from '@/components/AquaPanel.vue'
import AquaButton from '@/components/AquaButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const bookings = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const cancellingId = ref(null)

async function loadBookings() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const userId = authStore.user?._id || authStore.user?.id
    bookings.value = await fetchUserBookings(userId)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load bookings'
  } finally {
    isLoading.value = false
  }
}

async function handleCancel(booking) {
  const isPast = isBookingPast(booking.date, booking.slot)
  if (isPast) {
    errorMessage.value = 'Cannot cancel past reservations'
    return
  }

  const confirmDelete = window.confirm(
    `Are you sure you want to cancel your booking for ${booking.fieldDetails?.name || 'the field'} on ${booking.date} at ${booking.slot}?`,
  )
  if (!confirmDelete) return

  cancellingId.value = booking._id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await cancelBooking(booking.fieldId, booking._id)
    successMessage.value = 'Booking cancelled successfully'
    // Remove from local array
    bookings.value = bookings.value.filter((b) => b._id !== booking._id)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to cancel booking'
  } finally {
    cancellingId.value = null
  }
}

function isBookingPast(dateStr, slotStr) {
  if (!dateStr || !slotStr) return false
  const startTime = slotStr.split('-')[0]
  const bookingDateTime = new Date(`${dateStr}T${startTime}`)
  return bookingDateTime <= new Date()
}

onMounted(() => {
  loadBookings()
})
</script>

<template>
  <div class="user-bookings-view">
    <!-- Status Banners -->
    <div v-if="successMessage" class="banner success-banner">✓ {{ successMessage }}</div>
    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <AquaPanel title="My Court & Field Reservations">
      <div v-if="isLoading" class="loading-state">Loading your reservations...</div>

      <div v-else-if="bookings.length === 0" class="empty-state">
        <p>You currently have no booked fields.</p>
        <div class="empty-action">
          <router-link to="/fields">
            <AquaButton>Book a Sports Field Now</AquaButton>
          </router-link>
        </div>
      </div>

      <div v-else class="table-container">
        <table class="aqua-table">
          <thead>
          <tr>
            <th>Field / Sport</th>
            <th>Date</th>
            <th>Time Slot</th>
            <th>Type</th>
            <th>Status</th>
            <th style="text-align: center">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="booking in bookings"
            :key="booking._id"
            :class="{ 'past-row': isBookingPast(booking.date, booking.slot) }"
          >
            <td>
              <div class="field-title">
                {{ booking.fieldDetails?.name || 'Field ' + booking.fieldId }}
              </div>
              <div class="field-sub">
                {{ booking.fieldDetails?.sport ? `(${booking.fieldDetails.sport})` : '' }}
                {{ booking.fieldDetails?.address ? `— ${booking.fieldDetails.address}` : '' }}
              </div>
            </td>
            <td>{{ booking.date }}</td>
            <td>
              <strong>{{ booking.slot }}</strong>
            </td>
            <td>
              <span class="type-badge">{{ booking.type || 'Standard' }}</span>
            </td>
            <td>
                <span
                  :class="[
                    'status-pill',
                    isBookingPast(booking.date, booking.slot) ? 'status-past' : 'status-upcoming',
                  ]"
                >
                  {{ isBookingPast(booking.date, booking.slot) ? 'Completed' : 'Active' }}
                </span>
            </td>
            <td style="text-align: center">
              <AquaButton
                v-if="!isBookingPast(booking.date, booking.slot)"
                variant="danger"
                :disabled="cancellingId === booking._id"
                @click="handleCancel(booking)"
              >
                {{ cancellingId === booking._id ? 'Cancelling...' : 'Cancel' }}
              </AquaButton>
              <span v-else class="hint-text"> — </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.user-bookings-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.banner {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.success-banner {
  background: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.3);
  color: #155724;
}

.error-banner {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #721c24;
}

.loading-state,
.empty-state {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #48484a;
  padding: 24px;
}

.empty-action {
  margin-top: 14px;
}

.table-container {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.aqua-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: transparent;
}

.aqua-table th {
  background: rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px 14px;
  text-align: left;
  font-weight: 700;
  color: #111113;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.5px;
}

.aqua-table td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  vertical-align: middle;
  color: #111113;
}

.aqua-table tr:last-child td {
  border-bottom: none;
}

.aqua-table tr:nth-child(even) {
  background-color: rgba(0, 81, 199, 0.02);
}

.past-row {
  opacity: 0.6;
}

.field-title {
  font-weight: 700;
  color: #0051c7;
  font-size: 13px;
}

.field-sub {
  font-size: 11px;
  color: #48484a;
  font-weight: 500;
}

.type-badge {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 980px;
  font-size: 10px;
  font-weight: 700;
  text-transform: capitalize;
  color: #48484a;
}

.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-upcoming {
  background: rgba(40, 167, 69, 0.15);
  color: #155724;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.status-past {
  background: rgba(0, 0, 0, 0.06);
  color: #48484a;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.hint-text {
  font-size: 11px;
  color: #48484a;
  font-weight: 500;
}
</style>
