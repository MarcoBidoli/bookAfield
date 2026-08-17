<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchFields } from '@/api/fields'

import AquaPanel from '@/components/AquaPanel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'

const router = useRouter()

const fields = ref([])
const searchQuery = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function loadFields() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    fields.value = await fetchFields(searchQuery.value)
  } catch (err) {
    errorMessage.value = err.message || 'Error loading fields'
  } finally {
    isLoading.value = false
  }
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
    <Breadcrumbs section="Fields" section-to="/fields" current="Available Fields" />

    <!-- Feedback -->
    <div v-if="errorMessage" class="banner error-banner">⚠️ {{ errorMessage }}</div>

    <!-- Fields Directory -->
    <AquaPanel title="Sports Fields">
      <!-- Search -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          class="search-pill"
          placeholder="Filter fields by name or address..."
          @input="loadFields"
        />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="empty-state">Loading fields...</div>

      <!-- Empty -->
      <div v-else-if="fields.length === 0" class="empty-state">No sports fields found.</div>

      <!-- Fields -->
      <div v-else class="field-list">
        <div
          v-for="field in fields"
          :key="field._id"
          class="field-item"
          @click="bookField(field._id)"
        >
          <div class="field-header">
            <div class="field-title">
              <span class="field-name">
                {{ field.name }}
              </span>

              <span class="field-sport-badge">
                {{ field.sport }}
              </span>
            </div>
          </div>

          <div class="field-meta">
            <span> 📍 {{ field.address || 'Main Sports Complex' }} </span>

            <span> ⏱ {{ field.slots?.length || 0 }} Daily Slots </span>
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
  gap: 16px;
}

.banner {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.error-banner {
  background-color: #ffe6e6;
  border: 1px solid #ff9999;
  color: #990000;
}

.search-bar {
  margin-bottom: 12px;
}

.search-pill {
  width: 100%;
  box-sizing: border-box;
  border-radius: 14px !important;
  padding: 6px 10px 6px 26px !important;
  background: #ffffff
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='3'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E")
    8px center no-repeat !important;
  border: 1px solid #8e8e8e;
  font-size: 12px;
  outline: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

.search-pill:focus {
  border-color: #38a5e8;
  box-shadow:
    0 0 5px #70c3ff,
    inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 12px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field-item:hover {
  border-color: #38a5e8;
  background: #f8fbff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 5px;
}

.field-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.field-name {
  color: #0044bb;
  font-weight: bold;
  font-size: 13px;
}

.field-sport-badge {
  background: linear-gradient(180deg, #f0f0f0 0%, #d8d8d8 100%);
  border: 1px solid #b2b2b2;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: bold;
  text-transform: capitalize;
  white-space: nowrap;
}

.field-meta {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #666;
  flex-wrap: wrap;
}

.empty-state {
  font-size: 12px;
  color: #666;
  padding: 12px 0;
  text-align: center;
}
</style>
