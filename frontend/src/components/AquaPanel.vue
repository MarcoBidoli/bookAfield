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
  background: #f6f6f6;
  border: 1px solid #b4b4b4;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 #ffffff;
}

.group-title {
  font-size: 13px;
  font-weight: bold;
  color: #222;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #d9d9d9;
  text-shadow: 0 1px 0 #fff;
}
</style>
