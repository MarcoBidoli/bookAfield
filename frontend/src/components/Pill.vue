<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
  },
})

const variantClass = computed(() => `pill-${props.variant}`)
</script>

<template>
  <span :class="['pill', variantClass]">
    <slot />
  </span>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.pill-success {
  background: rgba(52, 199, 89, 0.12);
  color: #1b5e20;
  border: 1px solid rgba(52, 199, 89, 0.25);
}

.pill-warning {
  background: rgba(255, 149, 0, 0.12);
  color: #b25000;
  border: 1px solid rgba(255, 149, 0, 0.25);
}

.pill-danger {
  background: rgba(255, 59, 48, 0.12);
  color: #b71c1c;
  border: 1px solid rgba(255, 59, 48, 0.25);
}

.pill-muted {
  background: rgba(0, 0, 0, 0.04);
  color: #6e6e73;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.pill-primary {
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
  border: 1px solid rgba(0, 113, 227, 0.2);
}

.pill-default {
  background: rgba(0, 0, 0, 0.04);
  color: #48484a;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
