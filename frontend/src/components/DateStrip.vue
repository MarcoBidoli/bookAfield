<script setup>
import { computed, ref, watch } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  modelValue: {
    type: Date,
    default: () => new Date(),
  },

  minDate: {
    type: Date,
    default: () => new Date(),
  },
})

const emit = defineEmits(['update:modelValue'])

const visibleDays = 9

const selectedDate = ref(normalizeDate(props.modelValue))

const animationDirection = ref('next')

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function normalizeDate(date) {
  const result = new Date(date)

  result.setHours(0, 0, 0, 0)

  return result
}

function formatKey(date) {
  return [date.getFullYear(), date.getMonth(), date.getDate()].join('-')
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBeforeMinDate(date) {
  return normalizeDate(date) < normalizeDate(props.minDate)
}

const days = computed(() => {
  const result = []

  const start = new Date(selectedDate.value)

  start.setDate(start.getDate() - Math.floor(visibleDays / 2))

  for (let i = 0; i < visibleDays; i++) {
    const date = new Date(start)

    date.setDate(start.getDate() + i)

    result.push(date)
  }

  return result
})

watch(
  () => props.modelValue,
  (newDate) => {
    if (!newDate) {
      return
    }

    const newValue = normalizeDate(newDate)

    if (isSameDay(newValue, selectedDate.value)) {
      return
    }

    animationDirection.value = newValue > selectedDate.value ? 'next' : 'previous'

    selectedDate.value = newValue
  },
)

function selectDate(date) {
  if (isBeforeMinDate(date)) {
    return
  }

  const newDate = normalizeDate(date)

  animationDirection.value = newDate > selectedDate.value ? 'next' : 'previous'

  selectedDate.value = newDate

  emit('update:modelValue', new Date(newDate))
}

function moveDays(amount) {
  const date = new Date(selectedDate.value)

  date.setDate(date.getDate() + amount)

  if (isBeforeMinDate(date)) {
    return
  }

  selectDate(date)
}

function selectCalendarDate(date) {
  if (!date) {
    return
  }

  selectDate(date)
}
</script>

<template>
  <div class="date-picker">
    <!-- Previous -->
    <button
      class="date-nav"
      type="button"
      :disabled="isBeforeMinDate(new Date(selectedDate.getTime() - 86400000))"
      @click="moveDays(-1)"
    >
      <span>‹</span>
    </button>

    <!-- Date strip -->
    <div class="date-window">
      <Transition :name="`date-${animationDirection}`" mode="out-in">
        <div :key="days[0] && formatKey(days[0])" class="dates">
          <button
            v-for="date in days"
            :key="formatKey(date)"
            type="button"
            class="date-card"
            :class="{
              selected: isSameDay(date, selectedDate),
              disabled: isBeforeMinDate(date),
            }"
            :disabled="isBeforeMinDate(date)"
            @click="selectDate(date)"
          >
            <span class="weekday">
              {{ weekdays[date.getDay()] }}
            </span>

            <span class="day">
              {{ date.getDate() }}
            </span>

            <span class="month">
              {{ months[date.getMonth()] }}
            </span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- Next -->
    <button class="date-nav" type="button" @click="moveDays(1)">
      <span>›</span>
    </button>

    <!-- Calendar -->
    <VueDatePicker
      :model-value="selectedDate"
      :min-date="minDate"
      :enable-time-picker="false"
      :clearable="false"
      auto-apply
      :teleport="true"
      @update:model-value="selectCalendarDate"
    >
      <template #trigger>
        <button type="button" class="calendar-button" title="Choose a specific date">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 2v3M17 2v3M3.5 9.5h17M5 4.5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </template>
    </VueDatePicker>
  </div>
</template>

<style scoped>
.date-picker {
  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  padding: 6px;

  background: rgba(0, 0, 0, 0.025);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;

  box-sizing: border-box;
}

.date-window {
  flex: 1;
  min-width: 0;

  overflow: hidden;

  border-radius: 10px;
}

.dates {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));

  width: 100%;
}

.date-card {
  position: relative;

  min-width: 0;
  height: 82px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 6px 4px;

  background: var(--color-white);
  color: var(--color-darkgray);

  border: 0;
  border-right: 1px solid rgba(0, 0, 0, 0.07);

  cursor: pointer;

  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.date-card:first-child {
  border-radius: 10px 0 0 10px;
}

.date-card:last-child {
  border-right: none;
  border-radius: 0 10px 10px 0;
}

.date-card:hover:not(:disabled):not(.selected) {
  background: #eee;
  border-radius: 10px;
  transform: scale(0.94);
}

.date-card:active:not(:disabled) {
  transform: scale(0.96);
}

.date-card.selected {
  z-index: 2;

  margin: 3px;
  height: 76px;

  background: var(--color-primary);
  color: var(--color-white);

  border: none;
  border-radius: 10px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.date-card.selected:hover {
  background: var(--color-primary-hover-light);
}

.date-card.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.weekday {
  margin-bottom: 2px;

  font-size: 10px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.day {
  font-size: 25px;
  line-height: 28px;

  font-weight: 700;
  letter-spacing: -0.5px;
}

.month {
  margin-top: 1px;

  font-size: 9px;
  line-height: 12px;

  font-weight: 700;
  letter-spacing: 1px;

  opacity: 0.75;
}

/* --------------------------------------------------
   Navigation
-------------------------------------------------- */

.date-nav {
  width: 34px;
  height: 34px;

  flex: 0 0 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 50%;

  background: var(--color-white);
  color: var(--color-darkgray);

  cursor: pointer;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);

  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease,
    opacity 0.15s ease;
}

.date-nav span {
  font-size: 22px;
  line-height: 18px;

  transform: translateY(-1px);
}

.date-nav:hover:not(:disabled) {
  background: var(--color-lightgray-text);

  color: var(--color-white);

  transform: scale(1.05);
}

.date-nav:active:not(:disabled) {
  transform: scale(0.94);
}

.date-nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* --------------------------------------------------
   Calendar button
-------------------------------------------------- */

.calendar-button {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--color-white);
  color: var(--color-darkgray);

  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;

  cursor: pointer;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.calendar-button svg {
  width: 18px;
  height: 18px;
}

.calendar-button:hover {
  background: var(--color-primary);
  color: var(--color-white);
  transform: scale(1.05);
}

.calendar-button:active {
  transform: scale(0.94);
}

/* --------------------------------------------------
   Date transition
-------------------------------------------------- */

.date-next-enter-active,
.date-next-leave-active,
.date-previous-enter-active,
.date-previous-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.date-next-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.date-next-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.date-previous-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.date-previous-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

/* --------------------------------------------------
   Responsive
-------------------------------------------------- */

@media (max-width: 800px) {
  .dates {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .date-card:nth-child(n + 6) {
    display: none;
  }
}

@media (max-width: 500px) {
  .date-picker {
    gap: 6px;
    padding: 4px;
  }

  .date-nav {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
  }

  .calendar-button {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .date-card {
    height: 70px;
  }

  .date-card.selected {
    height: 64px;
  }

  .day {
    font-size: 21px;
    line-height: 24px;
  }

  .weekday {
    font-size: 8px;
  }

  .month {
    font-size: 8px;
  }
}
</style>
