<script setup>
import AquaPanel from '../components/AquaPanel.vue'
import AquaButton from '../components/AquaButton.vue'
</script>

<template>
  <div class="dashboard">
    <AquaPanel title="bookAfield Dashboard">
      <div class="welcome-section">
        <h2>Welcome to bookAfield</h2>

        <p>
          Manage your tournaments, book sports fields, and keep track of your matches in one place.
        </p>

        <div class="quick-actions">
          <router-link to="/tournaments">
            <AquaButton> View Tournaments </AquaButton>
          </router-link>

          <router-link to="/fields">
            <AquaButton variant="secondary"> Find a Field </AquaButton>
          </router-link>
        </div>
      </div>
    </AquaPanel>

    <AquaPanel title="What can you do?">
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
    </AquaPanel>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-section {
  padding: 4px 0;
}

.welcome-section h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #111113;
}

.welcome-section p {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #48484a;
  line-height: 1.5;
}

.quick-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.quick-actions a {
  text-decoration: none;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.feature {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.feature:hover {
  border-color: #0051c7;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 6px 16px rgba(0, 81, 199, 0.15);
}

.feature-title {
  font-size: 13px;
  font-weight: 700;
  color: #0051c7;
  margin-bottom: 6px;
}

.feature-text {
  font-size: 12px;
  font-weight: 500;
  color: #48484a;
  line-height: 1.5;
}
</style>
