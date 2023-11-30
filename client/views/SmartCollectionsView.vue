<script setup lang="ts">
import AllSmartCollectionsComponent from "@/components/SmartCollection/AllSmartCollectionsComponent.vue";
import CreateCollectionComponent from "../components/SmartCollection/CreateCollectionComponent.vue";
// import UserSmartCollectionsComponent from "@/components/SmartCollection/UserSmartCollectionsComponent.vue";
import MultiCollectionsView from "../components/SmartCollection/MultiCollectionsView.vue";

import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../utils/fetchy";

const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);

const user = ref(router.currentRoute.value.params.user);
const loaded = ref(false); 
const collections = ref<Array<Record<string, string>>>([]); 

//finds all collections owned/shared by user 
onBeforeMount(async () => {
  try {
    const response = await fetchy(`/api/collections/${user.value}`, "GET", {});
    console.log("smart collections view", response);
    collections.value = response;
  } catch (error) {
    console.error("Error getting collection notes:", error);
  } finally{
    loaded.value = true; 
  }
}); 

</script>

<template>
  <main class="container">
    <h3 class="major-labels">Smart <span style="color:#000">Collections</span></h3>
    <CreateCollectionComponent v-if="user == currentUsername"/>
    <MultiCollectionsView v-if="loaded" :collections="collections"/>
    <AllSmartCollectionsComponent />
  </main>
</template>

<style scoped>
.global-page-layout {
  max-width: 90%;
}
</style>
