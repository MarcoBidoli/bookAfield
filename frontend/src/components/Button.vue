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
  padding: 12px 16px;

  border: none;
  border-radius: 12px;
  outline: none;
  box-shadow: none;

  background: none;
  text-decoration: none;
  -webkit-appearance: none;;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;

  white-space: nowrap;
  user-select: none;
  cursor: pointer;

  transition:
    background-color 200ms cubic-bezier(0, 0, 1, 1),
    opacity 200ms cubic-bezier(0, 0, 1, 1);
}

/* Primary */
.btn-primary {
  background: linear-gradient(
    180deg,
    var(--color-primary-light) 0%,
    var(--color-primary) 50%,
    var(--color-primary-dark) 100%
  );
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(
    180deg,
    var(--color-primary-hover-light) 0%,
    var(--color-primary-hover) 50%,
    var(--color-primary-hover-dark) 100%
  );
}

/* Secondary / Light */
.btn-secondary,
.btn-light {
  background-color: var(--color-white);
  color: var(--color-black);
  border: 1px solid var(--color-border);
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
  opacity: 0.8;
}

/* Disabled */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
