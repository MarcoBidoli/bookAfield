<script setup>
import SportBadge from '@/components/SportBadge.vue'
import Pill from '@/components/Pill.vue'
import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import UsersIcon from '@/components/icons/UsersIcon.vue'

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

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'success'

    case 'registration':
    case 'upcoming':
      return 'warning'

    case 'completed':
    case 'played':
      return 'muted'

    default:
      return 'default'
  }
}

function formatStatus(status) {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1)
}

defineEmits(['click', 'delete'])
</script>

<template>
  <article class="tournament-card" @click="$emit('click')">
    <!-- Header -->
    <div class="tournament-card-header">
      <div class="tournament-info-group">
        <div class="tournament-titles">
          <router-link :to="`/tournaments/${tournament._id}`" class="tournament-name" @click.stop>
            {{ tournament.name }}
          </router-link>

          <SportBadge :sport="tournament.sport" />
        </div>
      </div>

      <Pill :variant="getStatusVariant(tournament.status)">
        {{ formatStatus(tournament.status) }}
      </Pill>
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
          {{ tournament.teams?.length || 0 }}
          / {{ tournament.maxTeams }} Teams Registered
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="tournament-card-footer">
      <div class="tournament-actions">
        <router-link :to="`/tournaments/${tournament._id}/matches`" class="action-link" @click.stop>
          Matches
        </router-link>

        <router-link
          :to="`/tournaments/${tournament._id}/standings`"
          class="action-link"
          @click.stop
        >
          Standings
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
  transition: all 0.1s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tournament-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 14px;
}

.tournament-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
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
  font-weight: 700;
  font-size: 16px;
  line-height: 1.3;
  letter-spacing: -0.2px;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  margin-bottom: 3px;
}

.tournament-name:hover {
  color: var(--color-primary);
}

.tournament-meta-grid {
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

.meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
  gap: 6px;
  flex-wrap: wrap;
}

.action-link,
.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--color-darkgray);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.1s ease;
}

.action-link:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--color-black);
}

.action-link:active {
  background: rgba(0, 0, 0, 0.07);
}

.delete-button {
  flex-shrink: 0;
  border: 1px solid rgba(255, 59, 48, 0.2);
  background: rgba(255, 59, 48, 0.08);
  color: var(--color-danger-banner);
  cursor: pointer;
}

.delete-button:hover {
  background: rgba(255, 59, 48, 0.15);
}

@media (max-width: 500px) {
  .tournament-card-header {
    flex-direction: column;
  }

  .tournament-card-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
