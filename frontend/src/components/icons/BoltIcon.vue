<script setup>
</script>

<template>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
        d="M13 2L5 13h6l-1 9 8-11h-6z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>

/* Overview */

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
  color: #111113;
  font-size: 14px;
}

.navigation-button svg,
.start-button svg {
  width: 16px;
  height: 16px;
}

/* Section heading */

.section-heading h2 {
  margin: 0;
  color: #111113;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.3px;
}

.section-heading p {
  margin: 5px 0 0;
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
}

/* Management panels */

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

/* Forms */

/* Teams */

/* Responsive */

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