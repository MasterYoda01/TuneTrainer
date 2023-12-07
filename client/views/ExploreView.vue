<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import MultiCollectionsComponent from "../components/Collection/MultiCollectionsComponent.vue";
import { fetchy } from "../utils/fetchy";

const publicCollections = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);

onBeforeMount(async () => {
  try {
    const publicCollectionsresponse = await fetchy("/api/publiccollections", "GET", {});
    publicCollections.value = publicCollectionsresponse;
  } catch (error) {
    console.error("Error getting collection notes:", error);
  } finally {
    loaded.value = true;
  }
});

const canEdit = ref(false);
</script>
<template>
  <main class="container">
    <h2 class="major-labels">ex<span style="color: #000">plore</span></h2>
    <MultiCollectionsComponent v-if="loaded" :collections="publicCollections" headerText="Public Collections" :canEdit="canEdit" />
  </main>
</template>
<style scoped></style>
