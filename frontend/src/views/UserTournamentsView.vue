<script setup>
import { ref, computed, onMounted } from 'vue'
import {useRoute, useRouter} from 'vue-router'

import { fetchUserById } from '@/api/users'

import Panel from '@/components/Panel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import AppBanner from '@/components/AppBanner.vue'
import LoadingState from '@/components/LoadingState.vue'
import EmptyState from '@/components/EmptyState.vue'
import TournamentCard from '@/components/TournamentCard.vue'

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
    errorMessage.value =
      err.message || 'Failed to load user tournaments'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="user-tournaments-view">
    <Breadcrumbs
      section="Users"
      section-to="/users"
      :current="user ? `${user.name} ${user.surname}` : 'User'"
    />

    <AppBanner
      v-if="errorMessage"
      type="error"
      :message="errorMessage"
    />

    <LoadingState
      v-if="isLoading"
      message="Loading profile and tournaments..."
    />

    <template v-else>
      <!-- User profile -->
      <div
        v-if="user"
        class="user-profile-card"
      >
        <div class="profile-avatar">
          {{ user.name?.charAt(0) || 'U' }}{{ user.surname?.charAt(0) || '' }}
        </div>

        <div class="profile-info">
          <h2 class="profile-name">
            {{ user.name }} {{ user.surname }}
          </h2>

          <span class="profile-username">
            @{{ user.username }}
          </span>

        </div>

        <div class="profile-stats">
          <div class="stat-box">
            <span class="stat-value">
              {{ tournaments.length }}
            </span>

            <span class="stat-label">
              Tournaments
            </span>
          </div>
        </div>
      </div>

      <!-- Tournaments -->
      <Panel title="Tournaments">
        <EmptyState
          v-if="tournaments.length === 0"
          title="No Tournaments found"
          message="This user hasn't hosted any tournaments yet."
        />

        <div
          v-else
          class="tournaments-grid"
        >
          <TournamentCard
            v-for="tournament in tournaments"
            :key="tournament._id"
            :tournament="tournament"
            @click="router.push(`/tournaments/${tournament._id}`)"
          />
        </div>
      </Panel>
    </template>
  </div>
</template>

<style scoped>
.user-tournaments-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* User Profile */

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
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;

  background: linear-gradient(
    135deg,
    #0071e3 0%,
    #409cff 100%
  );

  color: #ffffff;
  font-size: 24px;
  font-weight: 700;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.profile-name {
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  color: #111113;
  letter-spacing: -0.3px;
}

.profile-username {
  font-size: 13px;
  font-weight: 600;
  color: #0071e3;
}

.profile-stats {
  display: flex;
  gap: 12px;
}

.stat-box {
  min-width: 90px;

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

/* Tournaments */

.tournaments-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(320px, 1fr)
  );
  gap: 20px;
}

/* Mobile */

@media (max-width: 600px) {
  .user-profile-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .profile-info {
    min-width: 0;
  }

  .profile-stats {
    width: 100%;
    margin-top: 4px;
  }

  .stat-box {
    width: 100%;
  }

  .tournaments-grid {
    grid-template-columns: 1fr;
  }
}
</style>
