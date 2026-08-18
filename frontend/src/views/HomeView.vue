<script setup>
import { ref, onMounted } from 'vue'
import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import { fetchFields } from '@/api/fields'
import { fetchTournaments } from '@/api/tournaments'
import {fetchUsers} from "@/api/users.js";

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
    <!-- Welcome Panel -->
    <Panel title="bookAfield Dashboard">
      <div class="welcome-section">
        <h2>Welcome to bookAfield</h2>
        <p>
          Manage your tournaments, book sports fields, and keep track of your matches in one place.
        </p>

        <div class="quick-actions">
          <router-link to="/tournaments">
            <Button variant="primary"> View Tournaments </Button>
          </router-link>

          <router-link to="/fields">
            <Button variant="secondary"> Find a Field </Button>
          </router-link>
        </div>
      </div>
    </Panel>

    <!-- Stats Overview Section -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ isLoadingStats ? '...' : stats.fieldsCount }}</div>
          <div class="stat-label">Available Fields</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ isLoadingStats ? '...' : stats.tournamentsCount }}</div>
          <div class="stat-label">Tournaments</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
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
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.usersCount }}</div>
          <div class="stat-label">Users</div>
        </div>
      </div>
    </div>

    <!-- Features Panel -->
    <Panel title="What can you do?">
      <div class="features">
        <div class="feature">
          <div class="feature-title">Tournaments</div>
          <div class="feature-text">
            Create tournaments, register teams, generate fixtures, and manage results.
          </div>
        </div>

        <div class="feature">
          <div class="feature-title">Fields</div>
          <div class="feature-text">
            Browse available sports fields and make bookings for your activities.
          </div>
        </div>

        <div class="feature">
          <div class="feature-title">Matches</div>
          <div class="feature-text">
            View fixtures, assign field bookings, and keep tournament scores up to date.
          </div>
        </div>
      </div>
    </Panel>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.welcome-section {
  padding: 4px 0;
}

.welcome-section h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #111113;
  letter-spacing: -0.3px;
}

.welcome-section p {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #6e6e73;
  line-height: 1.5;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.quick-actions a {
  text-decoration: none;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.1s ease;
}

.stat-card:hover {
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.08);
}

.stat-icon {
  background: rgba(0, 113, 227, 0.08);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0071e3;
  flex-shrink: 0;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #111113;
  letter-spacing: -0.4px;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #6e6e73;
  margin-top: 2px;
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.feature {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.1s ease;
}

.feature:hover {
  border-color: rgba(0, 113, 227, 0.4);
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.08);
}

.feature-title {
  font-size: 13px;
  font-weight: 700;
  color: #0071e3;
  margin-bottom: 6px;
}

.feature-text {
  font-size: 12px;
  font-weight: 500;
  color: #6e6e73;
  line-height: 1.5;
}
</style>
