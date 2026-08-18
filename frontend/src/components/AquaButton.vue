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
  <button :type="type" :class="['aqua-btn', `aqua-btn-${variant}`]">
    <slot></slot>
  </button>
</template>

<style scoped>
.aqua-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  outline: none;
  white-space: nowrap;
  user-select: none;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

/* Primary / Blue Call-to-Action */
.aqua-btn-primary {
  background: linear-gradient(180deg, #4da6ff 0%, #1a82ff 50%, #0040a8 50.1%, #1a75ff 100%);
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 50, 150, 0.6);
  box-shadow: 0 3px 10px rgba(26, 130, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6);
}

.aqua-btn-primary:hover:not(:disabled) {
  background: linear-gradient(180deg, #66b3ff 0%, #3392ff 100%);
  box-shadow: 0 4px 14px rgba(26, 130, 255, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.7);
}

/* Secondary / Light / Gray Variant */
.aqua-btn-secondary,
.aqua-btn-light {
  background: linear-gradient(180deg, #fefefe 0%, #dedede 50%, #cecece 50.1%, #e6e6e6 100%);
  color: #333333;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.25);
}

.aqua-btn-secondary:hover:not(:disabled),
.aqua-btn-light:hover:not(:disabled) {
  background: linear-gradient(180deg, #ffffff 0%, #e5e5e5 50%, #d8d8d8 50.1%, #efefef 100%);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 1);
}

/* Danger / Brighter Red Variant */
.aqua-btn-danger {
  background: linear-gradient(180deg, #ff6b6b 0%, #e53935 50%, #c62828 50.1%, #ef5350 100%);
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.4);
  border-color: rgba(140, 20, 20, 0.7);
  box-shadow: 0 0 14px rgba(235, 64, 52, 0.5), 0 3px 10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 160, 160, 0.6);
}

.aqua-btn-danger:hover:not(:disabled) {
  background: linear-gradient(180deg, #ff8080 0%, #f04743 50%, #d32f2f 50.1%, #f66865 100%);
  box-shadow: 0 0 18px rgba(255, 75, 60, 0.65), 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 190, 190, 0.7);
}

/* Active / Pressed state */
.aqua-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

/* Disabled */
.aqua-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>
