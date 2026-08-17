<script setup>
defineProps({
  section: {
    type: String,
    default: '',
  },
  sectionTo: {
    type: String,
    default: '/',
  },
  parent: {
    type: Object,
    default: null,
  },
  current: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="breadcrumbs">
    <router-link :to="sectionTo" class="breadcrumb-link">
      {{ section }}
    </router-link>

    <!-- Parent item -->
    <template v-if="parent">
      <span class="breadcrumb-separator">›</span>

      <router-link :to="parent.to" class="breadcrumb-link">
        {{ parent.label }}
      </router-link>
    </template>

    <!-- Current page -->
    <template v-if="current">
      <span class="breadcrumb-separator">›</span>

      <span class="breadcrumb-current">
        {{ current }}
      </span>
    </template>
  </div>
</template>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
}

.breadcrumb-link {
  color: #0044bb;
  font-weight: bold;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #888;
  font-weight: bold;
}

.breadcrumb-current {
  color: #666;
  font-weight: bold;
}
</style>
