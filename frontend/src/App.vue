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
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.main-column {
  flex: 1;
  min-width: 0;
  min-height: 0;

  display: flex;
  flex-direction: column;

  overflow-y: auto;
  overflow-x: hidden;
}

.content-area {
  flex: 1;
  padding: 32px;
  background: transparent;
}
</style>
