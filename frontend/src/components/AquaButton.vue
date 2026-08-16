<script setup>
defineProps({
  type: { type: String, default: 'button' }
})
</script>

<template>
  <button :type="type" class="aqua-btn">
    <slot></slot>
  </button>
</template>

<style scoped>
.aqua-btn {
  background: linear-gradient(
    180deg,
    #8bcbfc 0%,
    #3092f7 48%,
    #0d6fe3 50%,
    #1e87f0 100%
  );
  border: 1px solid #08489b;
  border-radius: 12px;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 16px;
  cursor: pointer;
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.4);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.aqua-btn:active {
  background: linear-gradient(180deg, #0d6fe3 0%, #3092f7 100%);
}
</style>
