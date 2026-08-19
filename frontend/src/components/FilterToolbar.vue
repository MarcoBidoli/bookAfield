<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Search...' },
  filters: { type: Array, default: () => [] },
  modelFilter: { type: String, required: true }
})

defineEmits(['update:modelValue', 'update:modelFilter'])
</script>

<template>
  <div class="filter-toolbar">

    <!-- left filter buttons -->
    <div class="filter-buttons-group">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        :class="['filter-btn', { active: modelFilter === filter.value }]"
        @click="$emit('update:modelFilter', filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- right search bar -->
    <div class="search-wrapper">
      <input
        :value="modelValue"
        type="text"
        class="search-pill"
        :placeholder="searchPlaceholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}
.search-wrapper {
  flex: 1;
  min-width: 220px;
  max-width: 320px;
}
.search-pill {
  width: 100%;
  border-radius: 980px !important;
  padding-left: 36px !important;
  background: rgba(255, 255, 255, 0.95) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2348484a' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") 14px center no-repeat !important;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-black);
  outline: none;
  height: 38px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.1s ease;
}
.search-pill:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}
.filter-buttons-group {
  display: flex;
  gap: 6px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 4px;
  overflow-x: auto;
}
.filter-btn {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-darkgray);
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.filter-btn.active {
  background: var(--color-white);
  color: #171b1c;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  font-weight: 700;
}
.filter-btn:hover:not(.active) {
  color: var(--color-black);
}
</style>
