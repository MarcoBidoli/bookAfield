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
    `Are you sure you want to cancel your booking for ${booking.fieldDetails?.name || 'the field'} on ${booking.date} at ${booking.slot}?`
  )
  if (!confirmDelete) return

  cancellingId.value = booking._id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await cancelBooking(booking.fieldId, booking._id)
    successMessage.value = 'Booking cancelled successfully'
    // Remove from local array
    bookings.value = bookings.value.filter(b => b._id !== booking._id)
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
    <div v-if="successMessage" class="banner success-banner">
      ✓ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="banner error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <AquaPanel title="My Court & Field Reservations">
      <div v-if="isLoading" class="loading-state">
        Loading your reservations...
      </div>

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
              <th style="text-align: center;">Actions</th>
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
              <td><strong>{{ booking.slot }}</strong></td>
              <td>
                <span class="type-badge">{{ booking.type || 'Standard' }}</span>
              </td>
              <td>
                <span
                  :class="[
                    'status-pill',
                    isBookingPast(booking.date, booking.slot) ? 'status-past' : 'status-upcoming'
                  ]"
                >
                  {{ isBookingPast(booking.date, booking.slot) ? 'Completed' : 'Active' }}
                </span>
              </td>
              <td style="text-align: center;">
                <button
                  v-if="!isBookingPast(booking.date, booking.slot)"
                  type="button"
                  class="cancel-btn"
                  :disabled="cancellingId === booking._id"
                  @click="handleCancel(booking)"
                >
                  {{ cancellingId === booking._id ? 'Cancelling...' : 'Cancel' }}
                </button>

                <span v-else class="hint-text">
                  —
                </span>
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

.loading-state, .empty-state {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #555;
}

.empty-action {
  margin-top: 14px;
}

.table-container {
  overflow-x: auto;
}

/* Zebra Striped Aqua Table */
.aqua-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: #fff;
  border: 1px solid #b4b4b4;
  border-radius: 4px;
  overflow: hidden;
}

.aqua-table th {
  background: linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%);
  border-bottom: 1px solid #a6a6a6;
  border-right: 1px solid #d0d0d0;
  padding: 6px 10px;
  text-align: left;
  font-weight: bold;
  color: #333;
  text-shadow: 0 1px 0 #fff;
}

.aqua-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #f0f0f0;
  vertical-align: middle;
}

.aqua-table tr:nth-child(even) {
  background-color: #edf4f9; /* OS X Table Alternating Blue Tint */
}

.past-row {
  opacity: 0.65;
}

.field-title {
  font-weight: bold;
  color: #0044bb;
}

.field-sub {
  font-size: 11px;
  color: #666;
}

.type-badge {
  background: #e8e8e8;
  border: 1px solid #c0c0c0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  text-transform: capitalize;
}

.status-pill {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.status-upcoming {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-past {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

/* Red Aqua Cancel Button */
.cancel-btn {
  background: linear-gradient(
    180deg,
    #ff9690 0%,
    #f24b43 48%,
    #d6251c 50%,
    #e2362e 100%
  );
  border: 1px solid #991610;
  border-radius: 10px;
  color: #ffffff;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 10px;
  cursor: pointer;
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.4);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.cancel-btn:hover {
  background: linear-gradient(180deg, #ffa8a2 0%, #d6251c 100%);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-text {
  font-size: 11px;
  color: #888;
}
</style>
