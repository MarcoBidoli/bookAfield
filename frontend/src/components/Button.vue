<script setup>
defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'danger', 'light'].includes(val),
  },
})
</script>

<template>
  <button :type="type" :class="['btn', `btn-${variant}`]">
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  box-sizing: border-box;
  box-shadow: none;
  text-decoration: none;
  -webkit-appearance: none;
  transition-property: background-color, opacity;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0, 0, 1, 1);
  cursor: pointer;
  margin: 0;
  font-family: system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
  border-radius: 35px;
  padding: 12px 16px;
  white-space: nowrap;
  user-select: none;
}

/* Primary: Black background with white text */
.btn-primary {
  background-color: #000000;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #333333;
}

/* Secondary / Light: White background with black text */
.btn-secondary,
.btn-light {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled),
.btn-light:hover:not(:disabled) {
  background-color: #f6f6f6;
}

/* Danger Variant */
.btn-danger {
  background-color: #ef4444;
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

/* Active / Pressed state */
.btn:active:not(:disabled) {
  opacity: 0.8;
}

/* Disabled */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
