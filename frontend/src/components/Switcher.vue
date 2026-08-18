<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="segmented-control">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="[
        'tab-btn',
        { active: modelValue === option.value },
      ]"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented-control {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #48484a;
  padding: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.tab-btn.active {
  background: #ffffff;
  color: #171b1c;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  font-weight: 700;
}

.tab-btn:hover:not(.active) {
  color: #111113;
}
</style>
