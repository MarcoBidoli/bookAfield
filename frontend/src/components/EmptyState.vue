<script setup>
import FieldsIcon from "@/components/icons/FieldsIcon.vue";

defineProps({
  title: { type: String, default: 'No Results Found' },
  message: { type: String, default: 'Try adjusting your search criteria or filters.' }
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon-wrapper">
      <slot name="icon">
        <FieldsIcon/>
      </slot>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 20px;
  gap: 12px;
  color: var(--color-lightgray-text);
}
.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-darkgray);
  margin-bottom: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
}
.empty-state p {
  font-size: 13px;
  margin: 0;
}
</style>
