<script setup lang="ts">
import SingleSmartCollectionComponent from "@/components/SmartCollection/SingleSmartCollectionComponent.vue";
import router from "@/router";
import { onBeforeMount, ref } from "vue";

const collection_id = ref(router.currentRoute.value.params.id);
const loaded = ref(false); 

onBeforeMount(async () => {
  // get collection information by collection_id 
  loaded.value = true; 
});

</script>

<template>
  <main class="container">
    <h2 class="global-title">Smart Collection</h2>
    <section class="global-page-layout">
      <SingleSmartCollectionComponent v-if="loaded"/>
    </section>
  </main>
</template>

<style scoped>
.global-page-layout {
  max-width: 90%;
}
</style>
