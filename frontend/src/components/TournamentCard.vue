<script setup>
import SportBadge from '@/components/SportBadge.vue'
import StatusPill from '@/components/StatusPill.vue'
import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import UsersIcon from '@/components/icons/UsersIcon.vue'
import BookArrowIcon from '@/components/icons/BookArrowIcon.vue'

defineProps({
  tournament: {
    type: Object,
    required: true,
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click', 'delete'])

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'success'
    case 'registration':
      return 'primary'
    case 'completed':
      return 'muted'
    default:
      return 'default'
  }
}

function formatStatus(status) {
  switch (status) {
    case 'active':
      return 'In progress'
    case 'registration':
      return 'Registration open'
    case 'completed':
      return 'Completed'
    default:
      return status || ''
  }
}

function getSportClass(sport) {
  return `sport-${sport?.toLowerCase() || 'default'}`
}
</script>

<template>
  <article class="tournament-card" :class="getSportClass(tournament.sport)" @click="$emit('click')">
    <!-- Header -->
    <div class="tournament-card-header">
      <div class="tournament-titles">
        <router-link :to="`/tournaments/${tournament._id}`" class="tournament-name" @click.stop>
          {{ tournament.name }}
        </router-link>

        <SportBadge :sport="tournament.sport" />
      </div>

      <StatusPill :variant="getStatusVariant(tournament.status)">
        {{ formatStatus(tournament.status) }}
      </StatusPill>
    </div>

    <!-- Metadata -->
    <div class="tournament-meta-grid">
      <div class="meta-item">
        <CalendarIcon />
        <span class="meta-text"> Starts {{ tournament.startDate }} </span>
      </div>

      <div class="meta-item">
        <UsersIcon />
        <span class="meta-text">
          {{ tournament.teams?.length || 0 }} / {{ tournament.maxTeams }} Teams Registered
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="tournament-card-footer">
      <div class="tournament-actions">
        <router-link
          :to="`/tournaments/${tournament._id}/matches`"
          class="feature-action-btn"
          @click.stop
        >
          <span>Matches</span>
          <BookArrowIcon />
        </router-link>

        <router-link
          :to="`/tournaments/${tournament._id}/standings`"
          class="feature-action-btn"
          @click.stop
        >
          <span>Standings</span>
          <BookArrowIcon />
        </router-link>
      </div>

      <button
        v-if="isCreator"
        type="button"
        class="delete-button"
        @click.stop="$emit('delete', tournament)"
      >
        Delete
      </button>
    </div>
  </article>
</template>

<style scoped>
svg {
  width: 14px;
}

.tournament-card {
  background: var(--color-white);
  border: 1px solid var(--card-border-color);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.tournament-card:hover {
  border-color: var(--sport-color);
}

/* Sport colors */
.sport-football {
  --sport-color: rgb(0 89 23);
}

.sport-basketball {
  --sport-color: rgb(209 116 0);
}

.sport-volleyball {
  --sport-color: rgb(36 90 147);
}

.sport-default {
  --sport-color: var(--color-primary);
}

/* Header */
.tournament-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.tournament-titles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  min-width: 0;
}

.tournament-name {
  color: var(--color-black);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: color 0.15s ease;
}

.tournament-card:hover .tournament-name {
  color: var(--sport-color);
}

/* Metadata */
.tournament-meta-grid {
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

.meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer */
.tournament-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.tournament-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tournament-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feature-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 6px 11px;

  border: 1px solid var(--card-border-color);
  border-radius: 8px;

  background: var(--color-white);
  color: var(--color-darkgray);

  font-size: 12px;
  font-weight: 600;
  line-height: 16px;

  text-decoration: none;
  white-space: nowrap;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;
}

.feature-action-btn svg {
  width: 13px;
  height: 13px;
  transition: transform 0.15s ease;
}

.feature-action-btn:hover {
  background: color-mix(in srgb, var(--sport-color) 8%, white);
  border-color: var(--sport-color);
  color: var(--sport-color);
}

.feature-action-btn:hover svg {
  transform: translateX(2px);
}

.feature-action-btn:active {
  transform: scale(0.97);
}

/* Delete */
.delete-button {
  flex-shrink: 0;
  padding: 6px 14px;
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 8px;
  background: rgba(255, 59, 48, 0.08);
  color: var(--color-danger-banner);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.1s ease;
}

.delete-button:hover {
  background: var(--color-danger-hover);
  color: var(--color-white);
}

/* Mobile */
@media (max-width: 500px) {
  .tournament-card-header,
  .tournament-card-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
