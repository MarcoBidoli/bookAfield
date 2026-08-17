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
  gap: 16px;
}

.welcome-section {
  padding: 4px 0;
}

.welcome-section h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #222;
}

.welcome-section p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.quick-actions a {
  text-decoration: none;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.feature {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 12px;
}

.feature-title {
  font-size: 12px;
  font-weight: bold;
  color: #0044bb;
  margin-bottom: 5px;
}

.feature-text {
  font-size: 11px;
  color: #666;
  line-height: 1.5;
}
</style>
