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
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  margin: 0;
  padding: 8px 16px;

  border: 1px solid transparent;
  border-radius: 8px;
  outline: none;
  box-shadow: none;

  background: none;
  text-decoration: none;
  -webkit-appearance: none;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;

  white-space: nowrap;
  user-select: none;
  cursor: pointer;

  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 100ms ease;
}

/* Primary */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

/* Secondary / Light */
.btn-secondary,
.btn-light {
  background-color: var(--color-white);
  color: var(--color-black);
  border-color: var(--color-border);
}

.btn-secondary:hover:not(:disabled),
.btn-light:hover:not(:disabled) {
  background-color: var(--color-background-light);
}

/* Danger */
.btn-danger {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-danger-hover);
}

/* Active / Pressed */
.btn:active:not(:disabled) {
  transform: scale(0.97);
}

/* Disabled */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
