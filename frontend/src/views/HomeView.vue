<script setup>
import { onMounted, ref } from 'vue'
import BookArrowIcon from '@/components/icons/BookArrowIcon.vue'
import { fetchFields } from '@/api/fields'
import { fetchTournaments } from '@/api/tournaments'
import { fetchUsers } from '@/api/users.js'

const stats = ref({
  fieldsCount: 0,
  tournamentsCount: 0,
  usersCount: 0,
})
const isLoadingStats = ref(true)

onMounted(async () => {
  try {
    const [fields, tournaments, users] = await Promise.all([
      fetchFields().catch(() => []),
      fetchTournaments().catch(() => []),
      fetchUsers().catch(() => []),
    ])
    stats.value.fieldsCount = Array.isArray(fields) ? fields.length : 0
    stats.value.tournamentsCount = Array.isArray(tournaments) ? tournaments.length : 0
    stats.value.usersCount = Array.isArray(users) ? users.length : 0
  } catch (err) {
    console.error('Failed to load dashboard stats', err)
  } finally {
    isLoadingStats.value = false
  }
})
</script>

<template>
  <div class="dashboard">
    <!-- Hero Banner with Background Image & Embedded Metrics -->
    <section class="hero-card">
      <!-- Background Image & Gradient Mask Layer -->
      <div class="hero-bg-layer">
        <div class="hero-bg-image"></div>
        <div class="hero-bg-overlay"></div>
      </div>

      <div class="hero-inner">
        <div class="hero-header-content">
          <span class="hero-welcome-text">Welcome to bookAfield</span>
          <h1 class="hero-title">Find your field. Build your tournament. Play the game.</h1>
          <p class="hero-subtitle">
            Everything you need to discover sports fields, organize tournaments, and manage match
            schedules, all in one place.
          </p>
        </div>

        <!-- Embedded Stats Bar -->
        <div class="hero-stats-bar">
          <div class="hero-stat-item">
            <div class="hero-stat-value" :class="{ skeleton: isLoadingStats }">
              {{ isLoadingStats ? '' : stats.fieldsCount }}
            </div>
            <div class="hero-stat-label">Available Fields</div>
          </div>

          <div class="hero-stat-divider"></div>

          <div class="hero-stat-item">
            <div class="hero-stat-value" :class="{ skeleton: isLoadingStats }">
              {{ isLoadingStats ? '' : stats.tournamentsCount }}
            </div>
            <div class="hero-stat-label">Managed Tournaments</div>
          </div>

          <div class="hero-stat-divider"></div>

          <div class="hero-stat-item">
            <div class="hero-stat-value" :class="{ skeleton: isLoadingStats }">
              {{ isLoadingStats ? '' : stats.usersCount }}
            </div>
            <div class="hero-stat-label">Registered Users</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Features Grid -->
    <section class="features-section">
      <h2 class="section-title">Everything you need to play</h2>

      <div class="features-grid">
        <router-link to="/tournaments" class="feature-card">
          <div class="feature-header">
            <h3 class="feature-title">Tournaments</h3>
          </div>
          <p class="feature-text">
            Organize leagues, register teams, generate fixture schedules, and record match results
            effortlessly.
          </p>
          <div class="feature-action-btn">
            <span>Manage Tournaments</span>
            <BookArrowIcon />
          </div>
        </router-link>

        <router-link to="/fields" class="feature-card">
          <div class="feature-header">
            <h3 class="feature-title">Field Bookings</h3>
          </div>
          <p class="feature-text">
            Browse premier venues, check hourly availability, and reserve fields for your team
            practice or casual games.
          </p>
          <div class="feature-action-btn">
            <span>Book a Pitch</span>
            <BookArrowIcon />
          </div>
        </router-link>

        <router-link to="/tournaments" class="feature-card">
          <div class="feature-header">
            <h3 class="feature-title">Live Fixtures</h3>
          </div>
          <p class="feature-text">
            Stay up to date with match assignments, live scorekeeping, and tournament standings.
          </p>
          <div class="feature-action-btn">
            <span>View Live Fixtures</span>
            <BookArrowIcon />
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Hero Section with Embedded Background Image & Gradient Mask */
.hero-card {
  position: relative;
  background: #000000;
  border: solid 1px var(--card-border-color);
  border-radius: 16px;
  padding: 40px 36px;
  overflow: hidden;
}

.hero-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.hero-bg-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: url('/martin-sanchez-pX91vVDV6GQ-unsplash.jpg');
  background-size: cover;
  background-position: center 60%;
  transform: scale(1.05);
}

/* Pure Black left-to-right smooth gradient overlay */
.hero-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    15deg,
    rgba(0, 0, 0, 0.95),
    rgba(0, 0, 0, 0.85) 12.18%,
    rgba(0, 0, 0, 0.65) 50.84%,
    rgba(0, 0, 0, 0.35) 78.99%,
    rgba(0, 0, 0, 0.05)
  );
}

.hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hero-header-content {
  display: flex;
  flex-direction: column;
}

.hero-welcome-text {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.9;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.8px;
  margin-bottom: 12px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 15px;
  color: #dddddd;
  max-width: 650px;
  line-height: 1.6;
  margin-bottom: 0;
}

/* Embedded Hero Stats Bar */
.hero-stats-bar {
  display: flex;
  align-items: center;
  gap: 28px;
  padding-top: 22px;
  flex-wrap: wrap;
}

.hero-stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  min-height: 26px;
}

.hero-stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-stat-divider {
  width: 1px;
  height: 28px;
  background-color: rgba(255, 255, 255, 0.15);
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-actions a {
  text-decoration: none;
}

.btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 6px;
  vertical-align: text-bottom;
}

.skeleton {
  width: 40px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Features Grid */
.features-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-black);
  letter-spacing: -0.3px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  background: var(--color-white);
  border: 1px solid var(--card-border-color);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  text-decoration: none;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bg-primary {
  background-color: var(--color-primary);
}
.bg-emerald {
  background-color: #10b981;
}
.bg-indigo {
  background-color: #6366f1;
}

.feature-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-black);
}

.feature-text {
  font-size: 14px;
  color: var(--color-lightgray-text);
  line-height: 1.5;
  margin-bottom: 20px;
  flex-grow: 1;
}

/* Feature action button matching FieldCard book-action-indicator */
.feature-action-btn {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary-dark);
  background: rgba(0, 113, 227, 0.08);
  padding: 6px 14px;
  border-radius: 980px;
  transition: all 0.15s ease;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  cursor: pointer;
}

.feature-card:hover .feature-action-btn,
.feature-action-btn:hover {
  background: var(--color-primary);
  color: var(--color-white);
  text-decoration: none;
}

@media (max-width: 640px) {
  .hero-card {
    padding: 28px 20px;
  }
  .hero-title {
    font-size: 24px;
  }
}
</style>
