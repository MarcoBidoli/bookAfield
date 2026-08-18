<script setup>
import { computed } from 'vue'

const props = defineProps({
  sport: {
    type: String,
    required: true,
  },
})

const normalizedSport = computed(() =>
  (props.sport || '').toLowerCase().trim()
)

const sportClass = computed(() => {
  const sport = normalizedSport.value

  if (sport.includes('basket')) return 'sport-basketball'

  if (
    sport.includes('football') ||
    sport.includes('soccer') ||
    sport.includes('calcio')
  ) {
    return 'sport-football'
  }

  if (sport.includes('volley')) return 'sport-volleyball'

  return 'sport-default'
})

const displaySport = computed(() => {
  const s = normalizedSport.value
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Sport'
})
</script>

<template>
  <span :class="['sport-badge', sportClass]">

    <!-- Basketball -->
    <svg
      v-if="normalizedSport.includes('basket')"
      class="badge-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- Backboard -->
      <rect x="3" y="2" width="18" height="9" rx="1" />

      <!-- Backboard inner square -->
      <rect x="8" y="5" width="8" height="5" rx="0.5" />

      <!-- Rim -->
      <path d="M6 12h12" />

      <!-- Net sides -->
      <path d="M6.5 12l2 8" />
      <path d="M17.5 12l-2 8" />

      <!-- Net -->
      <path d="M9 12l1 8" />
      <path d="M12 12v8" />
      <path d="M15 12l-1 8" />

      <!-- Net bottom -->
      <path d="M8.5 20h7" />
    </svg>

    <!-- Football / Soccer -->
    <svg
      v-else-if="
        normalizedSport.includes('football') ||
        normalizedSport.includes('soccer') ||
        normalizedSport.includes('calcio')
      "
      class="badge-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- Goal frame -->
      <path d="M3 5v14" />
      <path d="M21 5v14" />
      <path d="M3 5h18" />

      <!-- Net horizontal lines -->
      <path d="M3 9h18" />
      <path d="M3 13h18" />
      <path d="M3 17h18" />

      <!-- Net vertical lines -->
      <path d="M7.5 5v14" />
      <path d="M12 5v14" />
      <path d="M16.5 5v14" />
    </svg>

    <!-- Volleyball -->
    <svg
      v-else-if="normalizedSport.includes('volley')"
      class="badge-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- Posts (extend all the way to the bottom) -->
      <path d="M2 2v20" stroke-width="2" />
      <path d="M22 2v20" stroke-width="2" />

      <!-- Thick Top Band -->
      <path d="M2 5h20" stroke-width="3" />

      <!-- Bottom Band (raised to leave room at the bottom) -->
      <path d="M2 16h20" stroke-width="2" />

      <!-- Side Boundary Tapes -->
      <path d="M5 5v11" stroke-width="1" opacity="0.6" />
      <path d="M19 5v11" stroke-width="1" opacity="0.6" />

      <!-- Horizontal Net Mesh -->
      <path d="M2 9h20" stroke-width="1" opacity="0.4" />
      <path d="M2 13h20" stroke-width="1" opacity="0.4" />

      <!-- Vertical Net Mesh -->
      <path d="M9 5v11" stroke-width="1" opacity="0.4" />
      <path d="M12 5v11" stroke-width="1" opacity="0.4" />
      <path d="M15 5v11" stroke-width="1" opacity="0.4" />
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

  color: #111113;
  background: transparent;

  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;

  border: 1px solid rgb(128 128 128 / 0.6);
}

.sport-basketball {
  border-color: rgb(237 132 0);
}

.sport-football {
  border-color: rgb(0 145 33);
}

.sport-volleyball {
  border-color: rgb(0 113 227);
}

.sport-default {
  border-color: rgb(128 128 128 / 0.6);
}

.badge-icon {
  flex-shrink: 0;
}
</style>
