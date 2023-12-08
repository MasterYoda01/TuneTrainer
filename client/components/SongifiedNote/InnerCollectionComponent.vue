<script setup lang="ts">
import { computed, defineProps } from "vue";

interface SongifiedNoteType {
  backgroundMusicLink: string;
  generatedLyrics: string;
  // Add other properties of songifiedNote here
}

const props = defineProps({
  songifiedNote: Object as () => SongifiedNoteType,
  collectionId: String,
});

// Computed property to get the full path of the MP3 file
const audioSrc = computed(() => {
  if (!props.songifiedNote?.backgroundMusicLink) return "";
  return new URL(`${props.songifiedNote.backgroundMusicLink}`, import.meta.url).href;
});
</script>

<template>
  <div class="inner-comp">
    <pre v-if="songifiedNote" class="lyrics">{{ songifiedNote.generatedLyrics }}</pre>
    <audio v-if="audioSrc" controls :src="audioSrc" type="audio/mpeg" id="music" preload="auto">Your browser does not support the audio element.</audio>
  </div>
</template>

<style scoped>
.lyrics {
  font-family: Arial, Helvetica, sans-serif;
  width: 70%;
  border-right: solid 2px #999;
  margin-right: 4%;
  text-align: justify;
  line-height: 0.9;
  padding-right: 4%;
}
.inner-comp {
  background-color: #fff;
  padding: 3% 4%;
  border: solid 1px #999;
  width: 150vh;
  border-radius: 15px;
  display: flex;
}
.inner-comp::hover {
  background-color: #5cb48c;
}
</style>
