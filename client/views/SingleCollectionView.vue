<script setup lang="ts">
import SingleCollectionComponent from "@/components/Collection/SingleCollectionComponent.vue";
import router from "@/router";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../utils/fetchy";

const collection_id = ref(router.currentRoute.value.params.id); // This doesn't work
const collection = ref<Record<string, string>>({});
const loaded = ref(false);

onBeforeMount(async () => {
  loaded.value = false;
  try {
    collection.value = await fetchy(`/api/collections/${collection_id.value}`, "GET", {});
    console.log(collection.value);
  } catch (error) {
    console.log(error);
  } finally {
    loaded.value = true;
  }
});
</script>

<template>
  <main class="container">
    <div class="loaded-content" v-if="loaded">
      <h3 v-if="!collection">Could not load this collection.</h3>
      <SingleCollectionComponent v-else :collection="collection" />
    </div>
    <h3 v-else>Loading...</h3>
  </main>
</template>

<style scoped></style>
