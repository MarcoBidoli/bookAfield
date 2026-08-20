<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true }
})
</script>

<template>
  <div class="page-header-section">
    <div>
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-subtitle">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>

<style scoped>
.page-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-black);
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}
.page-subtitle {
  font-size: 14px;
  color: var(--color-lightgray-text);
  margin: 0;
  font-weight: 500;
}
</style>
