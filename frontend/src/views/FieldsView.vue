<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchFields } from '@/api/fields'

import Panel from '@/components/Panel.vue'
import Breadcrumbs from '@/components/Breadcrumbs.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterToolbar from '@/components/FilterToolbar.vue'
import FieldCard from '@/components/FieldCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import AppBanner from '@/components/AppBanner.vue'

const router = useRouter()
const route = useRoute()

const fields = ref([])
const searchQuery = ref(route.query.q || '')
const isLoading = ref(true)
const errorMessage = ref('')

const sportFilters = [
  { label: 'All Fields', value: 'all' },
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Volleyball', value: 'volleyball' },
]

const selectedSportFilter = computed({
  get() {
    const rawFilter = route.query.filter
    const isValidFilter = sportFilters.some((f) => f.value === rawFilter)

    return isValidFilter ? rawFilter : 'all'
  },

  set(newValue) {
    const query = { ...route.query }
    const isValidFilter = sportFilters.some((f) => f.value === newValue)

    if (newValue && newValue !== 'all' && isValidFilter) {
      query.filter = newValue
    } else {
      delete query.filter
    }

    router.replace({ query })
  },
})

// Debounce search changes and synchronize them with the URL
let searchDebounceTimeout = null

watch(searchQuery, (newVal) => {
  clearTimeout(searchDebounceTimeout)

  searchDebounceTimeout = setTimeout(() => {
    const query = { ...route.query }
    const trimmed = newVal.trim()

    if (trimmed) {
      query.q = trimmed
    } else {
      delete query.q
    }

    router.replace({ query })

    loadFields(trimmed)
  }, 300)
})

// Keep the search input synchronized with browser navigation
watch(
  () => route.query.q,
  (newSearch) => {
    const value = newSearch || ''

    if (value !== searchQuery.value) {
      searchQuery.value = value
    }
  },
)

async function loadFields(query = searchQuery.value) {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // Search is handled by the REST API:
    // GET /api/fields?q=query
    fields.value = await fetchFields(query)
  } catch (err) {
    errorMessage.value = err.message || 'Error loading fields'
  } finally {
    isLoading.value = false
  }
}

// Sport filtering is still done locally because there is no
// sport parameter in the /api/fields endpoint.
const filteredFields = computed(() => {
  if (selectedSportFilter.value === 'all') {
    return fields.value
  }

  return fields.value.filter((field) => field.sport === selectedSportFilter.value)
})

function bookField(fieldId) {
  router.push(`/fields/${fieldId}/book`)
}

onMounted(() => {
  loadFields()
})
</script>

<template>
  <div class="fields-view">
    <Breadcrumbs section="Fields" section-to="/fields" current="Available Fields" />

    <PageHeader title="Sports Fields" subtitle="Discover and book available sports facilities" />

    <AppBanner v-if="errorMessage" type="error" :message="errorMessage" />

    <Panel>
      <FilterToolbar
        v-model="searchQuery"
        v-model:modelFilter="selectedSportFilter"
        search-placeholder="Search fields..."
        :filters="sportFilters"
      />

      <LoadingState v-if="isLoading" message="Loading available fields..." />

      <EmptyState
        v-else-if="filteredFields.length === 0"
        title="No Sports Fields Found"
        message="Try adjusting your search criteria or sport filters."
      />

      <div v-else class="fields-grid">
        <FieldCard
          v-for="field in filteredFields"
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
