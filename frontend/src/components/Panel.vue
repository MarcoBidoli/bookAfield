<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="group">
    <div v-if="title" class="group-title">
      {{ title }}
    </div>

    <div class="group-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.group-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-black);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  letter-spacing: -0.2px;
}
</style>
