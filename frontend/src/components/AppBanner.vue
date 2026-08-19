<script setup>
defineProps({
  type: { type: String, default: 'error' }, // options: 'error', 'success', 'warning'
  message: { type: String, required: true }
})
</script>

<template>
  <div :class="['banner', `banner-${type}`]">
    <!-- Error Icon -->
    <svg v-if="type === 'error'" class="banner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    <!-- Success Icon -->
    <svg v-else-if="type === 'success'" class="banner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>{{ message }}</span>
  </div>
</template>

<style scoped>
.banner {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.banner-error {
  background: rgba(255, 59, 48, 0.12);
  border: 1px solid rgba(255, 59, 48, 0.25);
  color: var(--color-danger-banner);
}
.banner-success {
  background: rgba(52, 199, 89, 0.12);
  border: 1px solid rgba(52, 199, 89, 0.25);
  color: #1b5e20;
}
.banner-icon {
  flex-shrink: 0;
}
</style>
