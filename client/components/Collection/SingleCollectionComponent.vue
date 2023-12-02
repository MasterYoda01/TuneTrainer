<script setup lang="ts">
import SongifiedNoteComponent from "@/components/SongifiedNote/SongifiedNoteComponent.vue";
import moment from "moment";
import { defineProps, onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import AccessControlManager from "../AccessControl/AccessControlManager.vue";

const props = defineProps(["collection"]);
const collection = props.collection;
const songifiedNotes = ref([]);

async function getSongNotesOfCollection(collection_id: string) {
  try {
    songifiedNotes.value = await fetchy(`/api/songifiednotes/collection/${collection_id}`, "GET", {});
  } catch (e) {
    console.log(e);
  }
}

onBeforeMount(async () => {
  await getSongNotesOfCollection(collection._id);
});
</script>

<template>
  <h2>{{ collection.title }}</h2>
  <span class="author">By {{ collection.owner }}</span>
  <span style="float: right; color: #999">Updated {{ moment(collection.dateUpdated).format("MM/DD/YY") }}</span>
  <div class="access-manage" v-if="collection.owner"><AccessControlManager v-bind:contentId="collection._id" /></div>
  <p class="description">{{ collection.description }}</p>
  <section class="song-notes-container">
    <div v-for="note in songifiedNotes" :key="note">
      <div class="song-note">
        <SongifiedNoteComponent :songifiedNote="note" />
      </div>
    </div>
  </section>
</template>

<style scoped>
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
  margin-top: 3em;
  gap: 2em;
}

.song-note {
  flex-basis: calc(33% - 2em);
  background-color: #fff;
  border: solid 1px #999;
  padding: 3% 5%;
  border-radius: 9px;
  margin-bottom: 2em;
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
