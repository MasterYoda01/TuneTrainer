<script setup lang="ts">
import AllSmartCollectionsComponent from "@/components/SmartCollection/AllSmartCollectionsComponent.vue";
import UserSmartCollectionsComponent from "@/components/SmartCollection/UserSmartCollectionsComponent.vue";
</script>

<template>
  <h3 class="global-title">SmartCollections</h3>
  <section class="global-page-layout">
    <UserSmartCollectionsComponent />
    <AllSmartCollectionsComponent />
  </section>
</template>

<style scoped>
.global-page-layout {
  max-width: 90%;
}
</style>
