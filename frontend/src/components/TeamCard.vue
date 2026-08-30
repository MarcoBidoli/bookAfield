<script setup>
import Panel from '@/components/Panel.vue'
import TrashIcon from '@/components/icons/TrashIcon.vue'
import UsersIcon from '@/components/icons/UsersIcon.vue'

defineProps({
  team: {
    type: Object,
    required: true,
  },
  canRemove: {
    type: Boolean,
    default: false,
  },
  isUpdating: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove', 'remove-player'])
</script>

<template>
  <Panel class="team-card">
    <!-- Team header -->
    <div class="team-header">
      <div class="team-title">
        <h3>{{ team.name }}</h3>

        <span>
          {{ team.players?.length || 0 }}
          {{ team.players?.length === 1 ? 'player' : 'players' }}
        </span>
      </div>

      <button
        v-if="canRemove"
        type="button"
        class="remove-button"
        :disabled="isUpdating"
        title="Remove team"
        @click="emit('remove')"
      >
        <TrashIcon />
      </button>
    </div>

    <!-- Roster -->
    <div class="roster">
      <div class="roster-header">
        <span>Roster</span>
      </div>

      <!-- Players -->
      <div v-if="team.players?.length" class="player-list">
        <div
          v-for="(player, playerIndex) in team.players"
          :key="player.userId || playerIndex"
          class="player-row"
        >
          <div class="player-info">
            <strong> {{ player.name }} {{ player.surname }} </strong>
          </div>

          <span v-if="player.jerseyNumber" class="jersey"> #{{ player.jerseyNumber }} </span>

          <!-- remove player button -->
          <button
            v-if="canRemove"
            type="button"
            class="remove-player-button"
            :disabled="isUpdating"
            title="Remove player"
            @click="emit('remove-player', playerIndex)"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <!-- Empty roster -->
      <div v-else class="empty-roster">
        <UsersIcon />

        <span>No players registered</span>
      </div>
    </div>
  </Panel>
</template>

<style scoped>
.team-card {
  padding: 22px;
  border-radius: 16px;
  border: 1px solid var(--card-border-color);
}

/* -------------------------------------------------------------------------- */
/* Team header                                                                */
/* -------------------------------------------------------------------------- */

.team-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.team-title {
  min-width: 0;
  flex: 1;
}

.team-title h3 {
  margin: 0;
  color: var(--color-black);
  font-size: 15px;
  font-weight: 750;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-title span {
  display: block;
  margin-top: 3px;
  color: #8e8e93;
  font-size: 11px;
  font-weight: 500;
}

/* -------------------------------------------------------------------------- */
/* Remove button                                                              */
/* -------------------------------------------------------------------------- */

.remove-button {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 8px;

  color: var(--color-danger-banner);
  background: rgba(255, 59, 48, 0.08);

  cursor: pointer;
}

.remove-button:hover {
  background: rgba(255, 59, 48, 0.14);
}

.remove-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-button svg {
  width: 17px;
  height: 17px;
}

/* -------------------------------------------------------------------------- */
/* Roster                                                                     */
/* -------------------------------------------------------------------------- */

.roster {
  margin-top: 18px;
}

.roster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.roster-header > span:first-child {
  font-size: 10px;
  font-weight: 750;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.roster-count {
  min-width: 22px;
  height: 22px;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 0 7px;
  border-radius: 999px;

  color: #48484a;
  background: rgba(0, 0, 0, 0.05);

  font-size: 10px;
  font-weight: 700;
}

/* -------------------------------------------------------------------------- */
/* Players                                                                    */
/* -------------------------------------------------------------------------- */

.player-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.player-row {
  display: flex;
  align-items: center;
  padding: 9px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  flex: 1;
  min-width: 0;
}

.player-info strong {
  color: #111113;
  font-size: 12px;
  font-weight: 650;
}

.jersey {
  padding: 4px 8px;
  color: #0071e3;
  font-size: 10px;
  font-weight: 750;
}

/* -------------------------------------------------------------------------- */
/* Empty roster                                                               */
/* -------------------------------------------------------------------------- */

.empty-roster {
  min-height: 90px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 7px;

  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 10px;

  color: #8e8e93;
  background: rgba(0, 0, 0, 0.015);

  font-size: 11px;
}

.empty-roster :deep(svg) {
  width: 22px;
  height: 22px;
}

.remove-player-button {
  width: 28px;
  height: 28px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 7px;

  color: var(--color-danger-banner);
  background: rgba(255, 59, 48, 0.08);

  cursor: pointer;
}

.remove-player-button:hover {
  background: rgba(255, 59, 48, 0.14);
}

.remove-player-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-player-button svg {
  width: 15px;
  height: 15px;
}
</style>
