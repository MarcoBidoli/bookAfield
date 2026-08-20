<script setup>
</script>

<template>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
        d="M5 19V10M12 19V5M19 19v-7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>

/* -------------------------------------------------------------------------- */
/* Overview                                                                   */
/* -------------------------------------------------------------------------- */

.sport-badge svg {
  width: 18px;
  height: 18px;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat strong {
  font-size: 14px;
  color: #111113;
}

.navigation-button svg,
.start-button svg {
  width: 16px;
  height: 16px;
}

/* -------------------------------------------------------------------------- */
/* Section heading                                                            */
/* -------------------------------------------------------------------------- */

.section-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 750;
  color: #111113;
  letter-spacing: -0.3px;
}

.section-heading p {
  margin: 5px 0 0;
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
}

/* -------------------------------------------------------------------------- */
/* Management panels                                                          */
/* -------------------------------------------------------------------------- */

.heading-icon svg {
  width: 19px;
  height: 19px;
}

.panel-heading h3 {
  margin: 0;
  color: #111113;
  font-size: 14px;
  font-weight: 700;
}

.panel-heading p {
  margin: 3px 0 0;
  color: #8e8e93;
  font-size: 11px;
}

/* -------------------------------------------------------------------------- */
/* Forms                                                                      */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Teams                                                                      */
/* -------------------------------------------------------------------------- */

.team-title h3 {
  margin: 0;
  color: #111113;
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

.remove-button svg {
  width: 17px;
  height: 17px;
}

.roster-header > span:first-child {
  font-size: 10px;
  font-weight: 750;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.player-info strong {
  color: #111113;
  font-size: 12px;
  font-weight: 650;
}

.player-info span {
  color: #8e8e93;
  font-size: 9px;
  font-weight: 500;
}

.empty-roster svg {
  width: 22px;
  height: 22px;
}

/* -------------------------------------------------------------------------- */
/* Registration footer                                                        */
/* -------------------------------------------------------------------------- */

.ready-message svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

/* -------------------------------------------------------------------------- */
/* Responsive                                                                 */
/* -------------------------------------------------------------------------- */

@media (max-width: 800px) {

}

@media (max-width: 600px) {

  .team-form button {
    width: 100%;
  }

  .player-form button {
    width: 100%;
  }

}
</style>