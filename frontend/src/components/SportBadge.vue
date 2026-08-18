<script setup>
import { computed } from 'vue'

const props = defineProps({
  sport: {
    type: String,
    required: true,
  },
})

const normalizedSport = computed(() => (props.sport || '').toLowerCase().trim())

const displaySport = computed(() => {
  const s = normalizedSport.value
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Sport'
})
</script>

<template>
  <span class="sport-badge">
    <!-- Basketball Icon -->
    <svg
      v-if="normalizedSport.includes('basket')"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="badge-icon"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M5.5 5.5C10 10 10 14 14 18.5" />
      <path d="M18.5 5.5C14 10 14 14 10 18.5" />
      <path d="M2 12h20" />
    </svg>

    <!-- Football / Soccer Icon -->
    <svg
      v-else-if="
        normalizedSport.includes('football') ||
        normalizedSport.includes('soccer') ||
        normalizedSport.includes('calcio')
      "
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="badge-icon"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>

    <!-- Default / Generic Ball Icon -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="badge-icon"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>

    <slot>{{ displaySport }}</slot>
  </span>
</template>

<style scoped>
.sport-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 980px;
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.2);
  color: #0071e3;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}

.badge-icon {
  color: #0071e3;
  flex-shrink: 0;
}
</style>
