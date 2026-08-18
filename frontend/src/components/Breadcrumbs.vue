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
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
}

.breadcrumb-link {
  color: #0051c7;
  font-weight: 700;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #8e8e93;
  font-weight: 600;
}

.breadcrumb-current {
  color: #48484a;
  font-weight: 700;
}
</style>
