<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps(["note"]);
const note = props.note;
</script>

<template>
  <h2>{{ note.generatedLyrics }}</h2>
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
