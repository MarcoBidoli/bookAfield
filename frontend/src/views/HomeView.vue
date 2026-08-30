<script setup>
import { onMounted, ref } from 'vue'
import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
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
  color: var(--color-black);
  letter-spacing: -0.3px;
}

.welcome-section p {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-lightgray-text);
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

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.feature {
  background: var(--color-white);
  padding: 18px;
  transition: all 0.1s ease;
}

.feature-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.feature-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-lightgray-text);
  line-height: 1.5;
}
</style>
