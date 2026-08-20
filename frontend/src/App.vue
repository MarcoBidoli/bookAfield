<script setup>
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <div class="main-column">
      <div class="content-card">
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
  gap: 12px;
  width: 100%;
  height: 100vh;
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
  background: #f1f3f5;
}

.main-column {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
}

.content-card {
  flex: 1;
  min-width: 0;

  background: #fff;

  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;

  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.05),
    0 8px 10px -6px rgba(0, 0, 0, 0.05);

  overflow-y: auto;
}

.content-area {
  padding: 32px;
}
</style>
