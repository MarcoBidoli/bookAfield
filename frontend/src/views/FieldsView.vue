<script setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {fetchFields} from '@/api/fields'

import Panel from '@/components/Panel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterToolbar from '@/components/FilterToolbar.vue'
import FieldCard from '@/components/FieldCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import AppBanner from '@/components/AppBanner.vue'

const router = useRouter()

const fields = ref([])
const searchQuery = ref('')
const selectedSportFilter = ref('all')
const isLoading = ref(true)
const errorMessage = ref('')

const sportFilters = [
  { label: 'All Fields', value: 'all' },
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Volleyball', value: 'volleyball' }
]

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
    <Breadcrumbs
      section="Fields"
      section-to="/fields"
      current="Available Fields"
    />

    <PageHeader
      title="Sports Fields"
      subtitle="Discover and book available sports facilities"
    />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <Panel>
      <FilterToolbar
        v-model="searchQuery"
        v-model:modelFilter="selectedSportFilter"
        search-placeholder="Search fields..."
        :filters="sportFilters"
        @update:model-value="loadFields"
      />

      <LoadingState v-if="isLoading" message="Loading available fields..." />

      <EmptyState
        v-else-if="filteredFields().length === 0"
        title="No Sports Fields Found"
        message="Try adjusting your search criteria or sport filters."
      />

      <div v-else class="fields-grid">
        <FieldCard
          v-for="field in filteredFields()"
          :key="field._id"
          :field="field"
          @click="bookField(field._id)"
        />
      </div>
    </Panel>
  </div>
</template>

<style scoped>
.fields-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
</style>
