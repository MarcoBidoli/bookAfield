<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-shell">
    <AppNavbar />

    <div class="app-body">
      <AppSidebar />

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

  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.main-column {
  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
  min-height: 0;
}

.content-area {
  flex: 1;
  min-height: 0;

  padding: 32px;

  overflow-y: auto;
  overflow-x: hidden;
}
</style>
