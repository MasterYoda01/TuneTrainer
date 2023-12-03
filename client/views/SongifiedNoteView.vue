<script setup lang="ts">
import SongifiedNoteComponent from "@/components/SongifiedNote/SongifiedNoteComponent.vue";
import router from "@/router";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../utils/fetchy";

const note_id = ref(router.currentRoute.value.params.id);
const note = ref<Record<string, string>>({});
const loaded = ref(false);

onBeforeMount(async () => {
  loaded.value = false;
  try {
    note.value = (await fetchy(`/api/songifiednotes/id/${note_id.value}`, "GET", {})).songNote;
  } catch (error) {
    console.log(error);
  } finally {
    loaded.value = true;
  }
});
</script>

<template>
  <main class="container">
    <SongifiedNoteComponent v-if="loaded" :note="note" />
    <h3 v-else>Loading...</h3>
  </main>
</template>

<style scoped></style>
