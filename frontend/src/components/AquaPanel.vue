<script setup>
defineProps({
  title: { type: String, required: true }
})
</script>

<template>
  <div class="aqua-group">
    <div class="group-title">{{ title }}</div>

    <div class="group-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.aqua-group {
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 14px;
  padding: 18px 22px;
  margin-bottom: 20px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1);
}

.group-title {
  font-size: 15px;
  font-weight: 700;
  color: #111113;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
