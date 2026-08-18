<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchFields } from '@/api/fields'

import AquaPanel from '@/components/AquaPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const router = useRouter()

// State
const fields = ref([])
const searchQuery = ref('')
const selectedSportFilter = ref('all')
const isLoading = ref(true)
const errorMessage = ref('')

async function loadFields() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const list = await fetchFields(searchQuery.value)
    fields.value = list
  } catch (err) {
    errorMessage.value = err.message || 'Error loading fields'
  } finally {
    isLoading.value = false
  }
}

function filteredFields() {
  if (selectedSportFilter.value === 'all') {
    return fields.value
  }

  return fields.value.filter(
    field => field.sport === selectedSportFilter.value
  )
}

function bookField(fieldId) {
  router.push(`/fields/${fieldId}/book`)
}

onMounted(() => {
  loadFields()
})
</script>

<template>
  <div class="fields-view">
    <!-- Breadcrumbs -->
    <Breadcrumbs
      section="Fields"
      section-to="/fields"
      current="Available Fields"
    />

    <!-- Feedback Banner -->
    <div v-if="errorMessage" class="banner error-banner">
      <span class="banner-icon">⚠️</span> {{ errorMessage }}
    </div>

    <!-- Fields Directory Panel -->
    <AquaPanel title="Sports Fields">
      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-pill"
          placeholder="Search fields by name or address..."
          @input="loadFields"
        />

        <div class="sport-filters">
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'all' }]"
            @click="selectedSportFilter = 'all'"
          >
            All
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'football' }]"
            @click="selectedSportFilter = 'football'"
          >
            Football
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'basketball' }]"
            @click="selectedSportFilter = 'basketball'"
          >
            Basketball
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: selectedSportFilter === 'volleyball' }]"
            @click="selectedSportFilter = 'volleyball'"
          >
            Volleyball
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading available fields...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredFields().length === 0" class="empty-state">
        <div class="empty-icon">🏟️</div>
        <h3>No Sports Fields Found</h3>
        <p>Try adjusting your search criteria or sport filters.</p>
      </div>

      <!-- Fields Grid -->
      <div v-else class="fields-grid">
        <div
          v-for="field in filteredFields()"
          :key="field._id"
          class="field-card"
          @click="bookField(field._id)"
        >
          <div class="field-card-header">
            <div class="field-info-group">
              <div class="field-sport-avatar">
                {{ field.sport === 'football' ? '⚽' : field.sport === 'basketball' ? '🏀' : '🏐' }}
              </div>
              <div class="field-titles">
                <h4 class="field-name">{{ field.name }}</h4>
                <span class="sport-badge">{{ field.sport }}</span>
              </div>
            </div>
            <span class="book-action-indicator">Book →</span>
          </div>

          <div class="field-meta-grid">
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span class="meta-text">{{ field.address || 'Main Sports Complex' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span class="meta-text">{{ field.slots?.length || 0 }} Slots Available</span>
            </div>
          </div>
        </div>
      </div>
    </AquaPanel>
  </div>
</template>

<style scoped>
.fields-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
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

/* Search & Filter Bar */
.filter-bar {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-pill {
  flex: 1;
  min-width: 240px;
  border-radius: 980px !important;
  padding-left: 36px !important;
  background: rgba(255, 255, 255, 0.95) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2348484a' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") 14px center no-repeat !important;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 13px;
  font-weight: 600;
  color: #111113;
  outline: none;
  height: 38px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.search-pill:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.04);
}

.sport-filters {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 4px;
}

.filter-btn {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 700;
  color: #48484a;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-btn:hover:not(.active) {
  color: #111113;
}

/* Fields Grid */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.field-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-card:hover {
  border-color: rgba(0, 113, 227, 0.3);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 6px 24px rgba(0, 113, 227, 0.08);
  transform: translateY(-1px);
}

.field-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 12px;
}

.field-info-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.field-sport-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 113, 227, 0.1);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(0, 113, 227, 0.15);
}

.field-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.field-name {
  color: #0071e3;
  font-weight: 700;
  font-size: 14px;
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sport-badge {
  background: rgba(0, 113, 227, 0.1);
  border: 1px solid rgba(0, 113, 227, 0.2);
  color: #0071e3;
  padding: 1px 8px;
  border-radius: 980px;
  font-size: 10px;
  font-weight: 700;
  text-transform: capitalize;
  width: fit-content;
}

.book-action-indicator {
  font-size: 11px;
  font-weight: 700;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
  padding: 4px 10px;
  border-radius: 980px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.field-card:hover .book-action-indicator {
  background: rgba(0, 113, 227, 0.15);
}

.field-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #48484a;
}

.meta-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  width: 28px;
  height: 28px;
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
