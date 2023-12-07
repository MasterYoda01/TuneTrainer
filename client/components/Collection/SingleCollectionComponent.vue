<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import moment from "moment";
import { storeToRefs } from "pinia";
import { defineProps, onBeforeMount, ref } from "vue";
import router from "../../router";
import { fetchy } from "../../utils/fetchy";
import AccessControlManager from "../AccessControl/AccessControlManager.vue";
import InnerCollectionComponent from "../SongifiedNote/InnerCollectionComponent.vue";

const props = defineProps(["collection"]);
const emit = defineEmits(["refreshCollections"]);
const collection = props.collection;
const songifiedNotes = ref<Array<Record<string, string>>>([]);
const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);

async function getSongNotesOfCollection(collection_id: string) {
  try {
    if (collection_id !== undefined) {
      const resp = await fetchy(`/api/songifiednotes/collection/${collection_id}`, "GET", {});
      songifiedNotes.value = resp;
    }
  } catch (e) {
    console.log(e);
  }
}

async function deleteCollection() {
  try {
    if (confirm("Are you sure you would like to delete?")) {
      await fetchy(`/api/collections/${collection._id}`, "DELETE");
      void router.push({ name: "Collections", params: { user: currentUsername.value } });
    }
  } catch (e) {
    alert(e);
  }
}
onBeforeMount(async () => {
  await getSongNotesOfCollection(collection._id);
  emit("refreshCollections");
});
</script>

<template>
  <h2>{{ collection.title }}</h2>
  <span class="author">By {{ collection.owner }}</span>
  <span style="float: right; color: #999">Updated {{ moment(collection.dateUpdated).format("MM/DD/YY") }}</span>
  <section class="controls">
    <AccessControlManager v-bind:contentId="collection._id" v-if="collection.owner" />
    <button class="trash" v-if="collection.owner == currentUsername" @click="deleteCollection">🗑️</button>
  </section>
  <p class="description">{{ collection.description }}</p>
  <section class="song-notes-container">
    <div v-for="note in songifiedNotes" :key="note._id">
      <RouterLink class="song-note-link" @refreshInnerCollections="getSongNotesOfCollection" :to="{ name: 'SongNote', params: { id: note._id } }">
        <InnerCollectionComponent :songifiedNote="{ backgroundMusicLink: note.backgroundMusicLink, generatedLyrics: note.generatedLyrics }" />
      </RouterLink>
    </div>
  </section>
</template>
<style scoped>
.controls {
  margin: 0.8em 0;
}
.trash {
  margin-top: -1em;
  margin-left: 0.8em;
}
.trash:hover {
  background-color: #db5c5c;
}
h2 {
  color: #5cb48c;
  font-size: 40px;
}
.description {
  color: #999;
}
.author {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.song-notes-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2em;
  gap: 2em;
}

.song-note-link {
  color: #000;
  text-decoration: none;
}
.feed-row {
  width: 50%;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.smart-collection-block {
  border: 1px solid #d9cafa;
  padding: 15px;
  border-radius: 8px;
}

.smart-collection-feed {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.smart-collection-block,
.Collection-feed {
  width: 97%;
}

h3 {
  margin-bottom: 10px;
  color: #333;
}

p {
  margin-bottom: 5px;
  color: #555;
}
</style>
