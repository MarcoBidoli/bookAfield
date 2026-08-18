<script setup>
import SportBadge from '@/components/SportBadge.vue'
import StatusPill from '@/components/StatusPill.vue'

defineProps({
  tournament: {
    type: Object,
    required: true
  },
  isCreator: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click', 'delete'])
</script>

<template>
  <article
    class="tournament-card"
    @click="$emit('click')"
  >
    <!-- Header -->
    <div class="tournament-card-header">
      <div class="tournament-info-group">

        <div class="tournament-titles">
          <router-link
            :to="`/tournaments/${tournament._id}`"
            class="tournament-name"
            @click.stop
          >
            {{ tournament.name }}
          </router-link>

          <SportBadge :sport="tournament.sport" />
        </div>
      </div>

      <StatusPill :status="tournament.status" />
    </div>

    <!-- Metadata -->
    <div class="tournament-meta-grid">
      <div class="meta-item">
        <svg
          class="meta-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <span class="meta-text">
          Starts {{ tournament.startDate }}
        </span>
      </div>

      <div class="meta-item">
        <svg
          class="meta-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>

        <span class="meta-text">
          {{ tournament.teams?.length || 0 }}
          / {{ tournament.maxTeams }} Teams Registered
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="tournament-card-footer">
      <div class="tournament-actions">
        <router-link
          :to="`/tournaments/${tournament._id}/matches`"
          class="action-link"
          @click.stop
        >
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
.tournament-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tournament-card:hover {
  border-color: rgba(0, 113, 227, 0.2);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.08);
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
  color: #111113;
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
  color: #0071e3;
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
  color: #48484a;
}

.meta-icon {
  color: #6e6e73;
  flex-shrink: 0;
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
  color: #48484a;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.1s ease;
}

.action-link:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #111113;
}

.action-link:active {
  background: rgba(0, 0, 0, 0.07);
}

.delete-button {
  flex-shrink: 0;
  border: 1px solid rgba(255, 59, 48, 0.2);
  background: rgba(255, 59, 48, 0.08);
  color: #b71c1c;
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
