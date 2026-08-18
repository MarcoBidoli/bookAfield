<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const normalizedStatus = computed(() => (props.status || '').toLowerCase())

const displayLabel = computed(() => {
  const s = normalizedStatus.value
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown'
})

const statusClass = computed(() => {
  switch (normalizedStatus.value) {
    case 'active':
      return 'status-active'
    case 'registration':
      return 'status-registration'
    case 'completed':
    case 'played':
      return 'status-completed'
    case 'upcoming':
      return 'status-upcoming'
    default:
      return 'status-default'
  }
})
</script>

<template>
  <span :class="['status-pill', statusClass]">
    <slot>
      {{ displayLabel }}
    </slot>
  </span>
</template>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-active {
  background: rgba(52, 199, 89, 0.12);
  color: #1b5e20;
  border: 1px solid rgba(52, 199, 89, 0.25);
}

.status-registration,
.status-upcoming {
  background: rgba(255, 149, 0, 0.12);
  color: #b25000;
  border: 1px solid rgba(255, 149, 0, 0.25);
}

.status-completed,
.status-played {
  background: rgba(0, 0, 0, 0.04);
  color: #6e6e73;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.status-default {
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
  border: 1px solid rgba(0, 113, 227, 0.2);
}
</style>
