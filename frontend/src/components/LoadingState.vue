<script setup>
defineProps({
  message: { type: String, default: 'Loading...' }
})
</script>

<template>
  <div class="loading-state">
    <div class="spinner"></div>
    <span>{{ message }}</span>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 20px;
  gap: 12px;
  color: #6e6e73;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 113, 227, 0.15);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
