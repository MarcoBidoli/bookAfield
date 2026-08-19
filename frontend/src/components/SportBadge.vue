<script setup>
import {computed} from 'vue'

import BasketIcon from '@/components/icons/BasketIcon.vue'
import FootballIcon from '@/components/icons/FootballIcon.vue'
import VolleyballIcon from '@/components/icons/VolleyballIcon.vue'

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
  if (sport.includes('football'))  return 'sport-football'
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

    <BasketIcon
      v-if="normalizedSport.includes('basket')"
    />

    <FootballIcon
      v-else-if="
        normalizedSport.includes('football')
      "
    />

    <VolleyballIcon
      v-else-if="normalizedSport.includes('volley')"
    />

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

  color: var(--color-black);
  background: transparent;

  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;

  border: 1px solid rgb(128 128 128 / 0.6);
}

.sport-basketball {
  border-color: rgb(209 116 0);
}

.sport-football {
  border-color: rgb(0 89 23);
}

.sport-volleyball {
  border-color: rgb(36 90 147);
}

.sport-default {
  border-color: rgb(128 128 128 / 0.6);
}

.badge-icon {
  flex-shrink: 0;
}
</style>
