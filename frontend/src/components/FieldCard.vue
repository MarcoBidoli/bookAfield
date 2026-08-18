<script setup>
defineProps({
  field: { type: Object, required: true }
})
defineEmits(['click'])
</script>

<template>
  <div class="field-card" @click="$emit('click')">
    <div class="field-card-header">
      <div class="field-info-group">
        <div class="field-sport-avatar">
          <svg v-if="field.sport === 'football'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 14.83 4.24 4.24"/></svg>
          <svg v-else-if="field.sport === 'basketball'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M5.636 5.636a14 14 0 0 1 0 12.728"/><path d="M18.364 5.636a14 14 0 0 0 0 12.728"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
        </div>
        <div class="field-titles">
          <h4 class="field-name">{{ field.name }}</h4>
          <span class="sport-badge">{{ field.sport }}</span>
        </div>
      </div>
      <span class="book-action-indicator">Book
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle;"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
      </span>
    </div>

    <div class="field-meta-grid">
      <div class="meta-item">
        <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="meta-text">{{ field.address || 'Main Sports Complex' }}</span>
      </div>
      <div class="meta-item">
        <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span class="meta-text">{{ field.slots?.length || 0 }} Slots Available</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.field-card:hover {
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.08);
}
.field-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 14px;
}
.field-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.field-sport-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(0, 113, 227, 0.12);
}
.field-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.field-name {
  color: #111113;
  font-weight: 700;
  font-size: 15px;
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sport-badge {
  background: rgba(0, 113, 227, 0.08);
  color: #0071e3;
  padding: 2px 8px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  width: fit-content;
}
.book-action-indicator {
  font-size: 12px;
  font-weight: 600;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
  padding: 6px 12px;
  border-radius: 980px;
  transition: all 0.1s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.field-card:hover .book-action-indicator {
  background: #0071e3;
  color: #ffffff;
}
.field-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #48484a;
}
.meta-icon {
  color: #6e6e73;
  flex-shrink: 0;
}
.meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
