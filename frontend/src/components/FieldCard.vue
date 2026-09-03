<script setup>
import { computed } from 'vue'

import FootballIcon from '@/components/icons/FootballIcon.vue'
import BasketIcon from '@/components/icons/BasketIcon.vue'
import VolleyballIcon from '@/components/icons/VolleyballIcon.vue'
import BookArrowIcon from '@/components/icons/BookArrowIcon.vue'
import PinPointIcon from '@/components/icons/PinPointIcon.vue'

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

const sportClass = computed(() => {
  switch (props.field.sport) {
    case 'football':
      return 'sport-football'
    case 'basketball':
      return 'sport-basketball'
    case 'volleyball':
      return 'sport-volleyball'
    default:
      return 'sport-default'
  }
})
</script>

<template>
  <div :class="['field-card', sportClass]" @click="$emit('click')">
    <div class="field-card-header">
      <div class="field-info-group">
        <div class="field-sport-avatar">
          <FootballIcon v-if="field.sport === 'football'" />
          <BasketIcon v-else-if="field.sport === 'basketball'" />
          <VolleyballIcon v-else />
        </div>

        <div class="field-titles">
          <h4 class="field-name">{{ field.name }}</h4>

          <span class="sport-badge">
            {{ field.sport }}
          </span>
        </div>
      </div>

      <span class="book-action-indicator">
        Book
        <BookArrowIcon />
      </span>
    </div>

    <div class="field-meta-grid">
      <div class="meta-item">
        <PinPointIcon />
        <span class="meta-text">
          {{ field.address || 'Main Sports Complex' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-card {
  --sport-color: rgb(128 128 128);
  --sport-bg: rgb(128 128 128 / 0.08);
  --sport-border: rgb(128 128 128 / 0.12);

  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 20px;

  background: #ffffff;
  border: 1px solid var(--card-border-color);
  border-radius: 16px;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

/* Sport colors */

.field-card.sport-football {
  --sport-color: rgb(0 89 23);
  --sport-bg: rgb(0 89 28 / 0.08);
  --sport-border: rgb(0 89 23 / 0.12);
}

.field-card.sport-basketball {
  --sport-color: rgb(209 116 0);
  --sport-bg: rgb(209 116 0 / 0.08);
  --sport-border: rgb(209 116 0 / 0.12);
}

.field-card.sport-volleyball {
  --sport-color: rgb(36 90 147);
  --sport-bg: rgb(36 90 147 / 0.08);
  --sport-border: rgb(36 90 147 / 0.12);
}

/* Card hover */

.field-card:hover {
  border-color: color-mix(in srgb, var(--sport-color) 35%, var(--card-border-color));

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Header */

.field-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 14px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

/* Sport information */

.field-info-group {
  display: flex;
  align-items: center;
  gap: 12px;

  min-width: 0;
}

.field-sport-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  padding: 8px;
  background: var(--sport-color);
  border-radius: 8px;

  color: var(--color-white);
}

.field-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.field-name {
  margin: 0;
  color: var(--color-black);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sport-badge {
  width: fit-content;
  padding: 2px 8px;
  background: var(--sport-bg);
  border-radius: 980px;
  color: var(--sport-color);

  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

/* Book action */

.book-action-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  flex-shrink: 0;

  padding: 6px 11px;

  background: var(--sport-bg);
  border: 1px solid transparent;
  border-radius: 980px;

  color: var(--sport-color);

  font-size: 12px;
  font-weight: 600;
  line-height: 16px;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.book-action-indicator svg {
  width: 13px;
  height: 13px;

  transition: transform 0.2s ease-in-out;
}

.field-card:hover .book-action-indicator {
  background: var(--sport-color);
  border-color: var(--sport-color);
  color: var(--color-white);
}

.field-card:hover .book-action-indicator svg {
  transform: translateX(2px);
}

/* Metadata */

.field-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--color-darkgray);

  font-size: 13px;
  font-weight: 500;
}

.meta-item svg {
  flex-shrink: 0;

  color: var(--color-darkgray);
}

.meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
