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

  background: #ffffff;
  border: 1px solid var(--card-border-color);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.1s ease;

  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* Header */
.field-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 14px;
}

/* Sport information */
.field-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.field-sport-avatar {
  width: 45px;
  height: 45px;
  border-radius: 8px;

  color: var(--color-white);
  background: var(--sport-color);

  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.field-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.field-name {
  color: var(--color-black);
  font-weight: 700;
  font-size: 15px;
  margin: 0;
  letter-spacing: -0.2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sport-badge {
  background: var(--sport-bg);
  color: var(--sport-color);

  padding: 2px 8px;
  border-radius: 980px;

  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;

  width: fit-content;
}

/* Book button */
.book-action-indicator {
  font-size: 12px;
  font-weight: 600;

  color: var(--sport-color);
  background: var(--sport-bg);

  padding: 6px 12px;
  border-radius: 980px;

  transition: all 0.1s ease;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  gap: 4px;
}

.field-card:hover .book-action-indicator {
  background: var(--sport-color);
  color: var(--color-white);
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

  font-size: 13px;
  font-weight: 500;
  color: var(--color-darkgray);
}

.meta-icon {
  color: var(--color-darkgray);
  flex-shrink: 0;
}

.meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
