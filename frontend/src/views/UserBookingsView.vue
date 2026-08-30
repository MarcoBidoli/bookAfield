<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { cancelBooking, fetchUserBookings } from '@/api/fields'

import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppBanner from '@/components/AppBanner.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import Pill from '@/components/Pill.vue'

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

    // reversed to show new bookings on top
    bookings.value = (await fetchUserBookings(userId)).reverse()
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load bookings'
  } finally {
    isLoading.value = false
  }
}

function isBookingPast(dateStr, slotStr) {
  if (!dateStr || !slotStr) {
    return false
  }

  const startTime = slotStr.split('-')[0]
  const bookingDateTime = new Date(`${dateStr}T${startTime}`)

  return bookingDateTime <= new Date()
}

function isPast(booking) {
  return isBookingPast(booking.date, booking.slot)
}

function getFieldName(booking) {
  return booking.fieldDetails?.name || `Field ${booking.fieldId}`
}

function getFieldDescription(booking) {
  const sport = booking.fieldDetails?.sport ? `(${booking.fieldDetails.sport})` : ''

  const address = booking.fieldDetails?.address ? `— ${booking.fieldDetails.address}` : ''

  return `${sport} ${address}`.trim()
}

function getBookingType(booking) {
  return booking.type === 'tournament' ? 'Tournament' : 'Standard'
}

function getBookingTypeVariant(booking) {
  return booking.type === 'tournament' ? 'primary' : 'neutral'
}

async function handleCancel(booking) {
  if (isPast(booking)) {
    errorMessage.value = 'Cannot cancel past reservations'
    return
  }

  const confirmed = window.confirm(
    `Are you sure you want to cancel your booking for ${getFieldName(booking)} on ${booking.date} at ${booking.slot}?`,
  )

  if (!confirmed) {
    return
  }

  cancellingId.value = booking._id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await cancelBooking(booking.fieldId, booking._id)

    successMessage.value = 'Booking cancelled successfully'

    bookings.value = bookings.value.filter((bookingItem) => bookingItem._id !== booking._id)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to cancel booking'
  } finally {
    cancellingId.value = null
  }
}

onMounted(loadBookings)
</script>

<template>
  <div class="user-bookings-view">
    <Breadcrumbs section="Fields" section-to="/fields" current="My Reservations" />

    <PageHeader title="My Reservations" subtitle="View and manage your sports field bookings" />

    <AppBanner v-if="successMessage" type="success" :message="successMessage" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <Panel title="Court & Field Reservations">
      <LoadingState v-if="isLoading" message="Loading your reservations..." />

      <EmptyState
        v-else-if="bookings.length === 0"
        title="No Reservations"
        message="You currently have no booked fields."
      >
        <template #action>
          <router-link to="/fields">
            <Button> Book a Sports Field </Button>
          </router-link>
        </template>
      </EmptyState>

      <div v-else class="table-container">
        <table class="bookings-table">
          <thead>
            <tr>
              <th>Field / Sport</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Type</th>
              <th>Status</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="booking in bookings"
              :key="booking._id"
              :class="{ 'past-row': isPast(booking) }"
            >
              <!-- Field -->
              <td>
                <div class="field-title">
                  {{ getFieldName(booking) }}
                </div>

                <div v-if="getFieldDescription(booking)" class="field-sub">
                  {{ getFieldDescription(booking) }}
                </div>
              </td>

              <!-- Date -->
              <td>
                {{ booking.date }}
              </td>

              <!-- Slot -->
              <td>
                <strong>{{ booking.slot }}</strong>
              </td>

              <!-- Type -->
              <td>
                {{ getBookingType(booking) }}
              </td>

              <!-- Status -->
              <td>
                <Pill :status="isPast(booking) ? 'completed' : 'active'">
                  {{ isPast(booking) ? 'Completed' : 'Active' }}
                </Pill>
              </td>

              <!-- Actions -->
              <td class="actions-column">
                <Button
                  v-if="!isPast(booking)"
                  variant="danger"
                  :disabled="cancellingId === booking._id"
                  @click="handleCancel(booking)"
                >
                  {{ cancellingId === booking._id ? 'Cancelling...' : 'Cancel' }}
                </Button>

                <span v-else class="hint-text"> — </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  </div>
</template>

<style scoped>
.user-bookings-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: transparent;
}

.bookings-table th {
  background: rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px 14px;
  text-align: left;
  font-weight: 700;
  color: var(--color-black);
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 1px;
  white-space: nowrap;
}

.bookings-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  vertical-align: middle;
  color: var(--color-black);
}

.bookings-table tbody tr:last-child td {
  border-bottom: none;
}

.bookings-table tbody tr:nth-child(even) {
  background: rgba(0, 81, 199, 0.02);
}

.bookings-table tbody tr:hover {
  background: rgba(0, 113, 227, 0.04);
}

.past-row {
  opacity: 0.6;
}

.field-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-black);
}

.field-sub {
  margin-top: 3px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-lightgray-text);
}

.actions-column {
  text-align: center !important;
  white-space: nowrap;
}

.hint-text {
  font-size: 11px;
  color: var(--color-lightgray-text);
  font-weight: 500;
}

@media (max-width: 700px) {
  .bookings-table {
    min-width: 750px;
  }
}
</style>
