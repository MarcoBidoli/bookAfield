<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
  },
})

const variantClass = computed(() => `status-${props.variant}`)
</script>

<template>
  <span :class="['status', variantClass]">
    <span class="status-led" aria-hidden="true" />
    <span class="status-label">
      <slot />
    </span>
  </span>
</template>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.status-led {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 12%, transparent);
}

.status-success {
  color: #2f8f46;
}

.status-warning {
  color: #c18303;
}

.status-danger {
  color: #c43d36;
}

.status-muted {
  color: #8a8a8a;
}

.status-primary {
  color: #3478b9;
}

.status-default {
  color: #6e6e73;
}
</style>
