<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, defineProps, ref } from "vue";
import { useRoute } from "vue-router";
import router from "../../router";
import { fetchy } from "../../utils/fetchy";

const loading = ref(false);
const props = defineProps(["note"]);

const emit = defineEmits(["refreshInnerCollections"]);
const note = props.note;
const route = useRoute();

const collectionId = route.params.collectionid; // Adjust the parameter name if needed

const userStore = useUserStore();
const { isLoggedIn, currentUsername } = storeToRefs(userStore);

const audioSrc = computed(() => {
  return new URL(`${note.backgroundMusicLink}`, import.meta.url).href;
});
const canEdit = ref<boolean>(note.author === currentUsername.value);

const deleteNote = async () => {
  if (confirm("Are you sure you want to delete?")) {
    const collection_id = String(collectionId);
    let query = { _id: note._id, collectionid: collection_id };
    await fetchy("/api/delete/songifiednote", "DELETE", { query });
    emit("refreshInnerCollections");
    void router.push({ name: "Collections", params: { user: currentUsername.value } });
  }
};
</script>
<template>
  <div class="audio-container">
    <button v-if="note.author == currentUsername" class="trash" @click="deleteNote()">🗑️</button>
    <audio v-if="audioSrc" controls :src="audioSrc" type="audio/mpeg" id="music" preload="auto">Your browser does not support the audio element.</audio>
  </div>

  <div class="column-container">
    <section class="notes">
      <h3>Notes inputted</h3>

      {{ note.rawNote }}
    </section>
    <section class="lyrics">
      <h3>Generated Song</h3>

      {{ note.generatedLyrics }}
    </section>
  </div>
  <!-- <span class="author">By {{ collection.owner }}</span>
  <span style="float: right; color: #999">Updated {{ moment(collection.dateUpdated).format("MM/DD/YY") }}</span>
  <div class="access-manage" v-if="collection.owner"><AccessControlManager v-bind:contentId="collection._id" /></div>
  <p class="description">{{ collection.description }}</p>
  <section class="song-notes-container">
    <div v-for="note in songifiedNotes" :key="note._id">
      <RouterLink class="song-note" :to="{ name: 'SongNote', params: { id: note._id } }">
        <InnerCollectionComponent :songifiedNote="{ backgroundMusicLink: note.backgroundMusicLink, generatedLyrics: note.generatedLyrics }" />
      </RouterLink>
    </div>
  </section> -->
</template>

<style scoped>
h3 {
  margin-bottom: 0.5em;
  text-transform: uppercase;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 600;
  font-size: 16px;
  border-radius: 5px;
  border: solid 1px #5cb48c;
  padding: 3px 9px;
  width: 100%;
}
.column-container {
  display: flex;
  gap: 3%;
}
.notes,
.lyrics {
  background-color: #fff;
  border: solid 1px #999;
  border-radius: 15px;
  padding: 2% 2.5%;
  width: 50%;
}
.audio-container {
  text-align: right;
  margin-bottom: 2%;
}
</style>
