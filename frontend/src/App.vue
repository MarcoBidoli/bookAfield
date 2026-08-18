<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-shell">
    <!-- Top High-Contrast Glass Navigation Bar -->
    <AppNavbar />

    <!-- Main Layout: Full screen Body with Sidebar and Content -->
    <div class="app-body">
      <AppSidebar />

      <!-- Right side: content + footer -->
      <div class="main-column">
        <main class="content-area">
          <router-view />
        </main>

        <AppFooter />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-body {
  display: flex;
  flex: 1;
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-area {
  flex: 1;
  padding: 32px;
  background: transparent;
  overflow-y: auto;
}
</style>
