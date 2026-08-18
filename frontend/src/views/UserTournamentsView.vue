<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchUserById } from '@/api/users'

import AquaPanel from '@/components/AquaPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const tournaments = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const userId = computed(() => route.params.id)

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await fetchUserById(userId.value)

    user.value = data.user
    tournaments.value = data.tournaments || []
  } catch (err) {
    errorMessage.value = err.message || 'Failed to load user tournaments'
  } finally {
    isLoading.value = false
  }
}

function openTournament(tournamentId) {
  router.push(`/tournaments/${tournamentId}`)
}

function formatDate(date) {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('en-GB')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="user-tournaments-view">
    <!-- Breadcrumbs -->
    <Breadcrumbs
      section="Users"
      section-to="/users"
      :current="user ? `${user.name} ${user.surname}` : 'User'"
    />

    <!-- Error -->
    <div v-if="errorMessage" class="banner error-banner">
      <span class="banner-icon">⚠️</span> {{ errorMessage }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading profile and tournaments...</span>
    </div>

    <template v-else>
      <!-- User Profile Card on Top -->
      <div class="user-profile-card" v-if="user">
        <div class="profile-avatar">
          {{ user.name?.charAt(0) || 'U' }}{{ user.surname?.charAt(0) || '' }}
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{{ user.name }} {{ user.surname }}</h2>
          <span class="profile-username">@{{ user.username }}</span>
          <p class="profile-bio">Tournament Host & Organizer</p>
        </div>
        <div class="profile-stats">
          <div class="stat-box">
            <span class="stat-value">{{ tournaments.length }}</span>
            <span class="stat-label">Tournaments</span>
          </div>
        </div>
      </div>

      <!-- Tournaments Feed (Tweet style) -->
      <div class="tournaments-feed-container">
        <div class="feed-header-bar">
          <h3>Tournament Timeline</h3>
          <span class="feed-count">{{ tournaments.length }} posts</span>
        </div>

        <div v-if="tournaments.length === 0" class="empty-state">
          <div class="empty-icon">🏆</div>
          <h3>No Tournaments Posted</h3>
          <p>This user hasn't hosted or posted any tournaments yet.</p>
        </div>

        <div v-else class="tweet-feed">
          <div
            v-for="tournament in tournaments"
            :key="tournament._id"
            class="tweet-card"
            @click="openTournament(tournament._id)"
          >
            <!-- Tweet Top: Author + Status -->
            <div class="tweet-header">
              <div class="tweet-author">
                <div class="author-mini-avatar">
                  {{ user?.name?.charAt(0) || 'U' }}
                </div>
                <div class="author-details">
                  <span class="author-name">{{ user?.name }} {{ user?.surname }}</span>
                  <span class="author-handle">@{{ user?.username }}</span>
                </div>
              </div>
              <span :class="['status-pill', `status-${tournament.status}`]">
                {{ tournament.status }}
              </span>
            </div>

            <!-- Tweet Body / Content -->
            <div class="tweet-content">
              <h4 class="tweet-title">{{ tournament.name }}</h4>
              <div class="tweet-tags">
                <span class="sport-badge" v-if="tournament.sport">
                   {{ tournament.sport }}
                </span>
                <span class="date-tag">📅 Starts {{ formatDate(tournament.startDate) }}</span>
              </div>
            </div>

            <!-- Tweet Footer / Metrics & Action -->
            <div class="tweet-footer">
              <div class="tweet-metrics">
                👥 <strong>{{ tournament.teams?.length || 0 }}</strong> / {{ tournament.maxTeams }} Teams Registered
              </div>
              <div class="tweet-action">
                View Tournament <span>›</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.user-tournaments-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.banner {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.error-banner {
  background: rgba(255, 59, 48, 0.12);
  border: 1px solid rgba(255, 59, 48, 0.25);
  color: #b71c1c;
}

/* User Profile Card */
.user-profile-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3 0%, #409cff 100%);
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
  flex-shrink: 0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #111113;
  margin: 0;
  letter-spacing: -0.3px;
}

.profile-username {
  font-size: 13px;
  font-weight: 600;
  color: #0071e3;
}

.profile-bio {
  font-size: 12px;
  color: #48484a;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.profile-stats {
  display: flex;
  gap: 12px;
}

.stat-box {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #111113;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Feed Section */
.tournaments-feed-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.feed-header-bar h3 {
  font-size: 15px;
  font-weight: 700;
  color: #111113;
  margin: 0;
  letter-spacing: -0.2px;
}

.feed-count {
  font-size: 12px;
  font-weight: 600;
  color: #8e8e93;
}

/* Tweet Cards */
.tweet-feed {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tweet-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 18px 20px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}

.tweet-card:hover {
  border-color: rgba(0, 113, 227, 0.3);
  box-shadow: 0 6px 24px rgba(0, 113, 227, 0.08);
  background: rgba(255, 255, 255, 0.96);
  transform: translateY(-1px);
}

.tweet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.tweet-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-mini-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.author-name {
  font-size: 13px;
  font-weight: 700;
  color: #111113;
  letter-spacing: -0.1px;
}

.author-handle {
  font-size: 11px;
  font-weight: 500;
  color: #8e8e93;
}

/* Status Badges */
.status-pill {
  padding: 3px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}

.status-registration {
  background: rgba(255, 193, 7, 0.15);
  color: #856404;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.status-active {
  background: rgba(52, 199, 89, 0.15);
  color: #1b5e20;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.status-completed {
  background: rgba(142, 142, 147, 0.15);
  color: #48484a;
  border: 1px solid rgba(142, 142, 147, 0.3);
}

/* Tweet Content */
.tweet-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tweet-title {
  font-size: 15px;
  font-weight: 700;
  color: #0071e3;
  margin: 0;
  letter-spacing: -0.2px;
}

.tweet-tags {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.sport-badge {
  background: rgba(0, 113, 227, 0.1);
  border: 1px solid rgba(0, 113, 227, 0.2);
  color: #0071e3;
  padding: 2px 10px;
  border-radius: 980px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}

.date-tag {
  font-size: 12px;
  color: #48484a;
  font-weight: 500;
}

/* Tweet Footer */
.tweet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  color: #48484a;
  font-weight: 500;
  flex-wrap: wrap;
  gap: 8px;
}

.tweet-action {
  color: #0071e3;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: transform 0.2s ease;
}

.tweet-card:hover .tweet-action {
  transform: translateX(3px);
}

/* States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 20px;
  gap: 12px;
  color: #48484a;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: #111113;
  margin: 0;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 113, 227, 0.15);
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
