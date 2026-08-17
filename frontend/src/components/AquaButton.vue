<script setup>
defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
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
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 16px;
  cursor: pointer;
}

/* Primary / Call to Action */
.aqua-btn-primary {
  background: linear-gradient(180deg, #8bcbfc 0%, #3092f7 48%, #0d6fe3 50%, #1e87f0 100%);
  border: 1px solid #08489b;
  color: #ffffff;
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.4);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.aqua-btn-primary:hover {
  background: linear-gradient(180deg, #0d6fe3 0%, #3092f7 100%);
}

/* Secondary / Cancel */
.aqua-btn-secondary {
  background: linear-gradient(180deg, #ffffff 0%, #eeeeee 48%, #dddddd 50%, #eeeeee 100%);
  border: 1px solid #999;
  color: #333;
  text-shadow: none;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.aqua-btn-secondary:hover {
  background: linear-gradient(180deg, #eeeeee 0%, #d5d5d5 100%);
}

/* Pressed state */
.aqua-btn:active {
  transform: translateY(1px);
}

/* Disabled */
.aqua-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.aqua-btn-danger {
  background: linear-gradient(180deg, #ff9999 0%, #e85c5c 48%, #c92f2f 50%, #e04444 100%);
  border: 1px solid #9b1c1c;
  color: #ffffff;
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.35);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.aqua-btn-danger:hover {
  background: linear-gradient(180deg, #c92f2f 0%, #e85c5c 100%);
}
</style>
