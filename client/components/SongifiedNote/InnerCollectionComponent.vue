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
  <audio v-if="audioSrc" controls :src="audioSrc" type="audio/mpeg" id="music" preload="auto" style="float: right;">
    Your browser does not support the audio element.
  </audio>
  <div class="inner-comp" style="margin-top: 1em;">
    <pre v-if="songifiedNote" class="lyrics">{{ songifiedNote.generatedLyrics }}</pre>
  </div>
</template>

<style scoped>
.lyrics {
  font-family: Arial, Helvetica, sans-serif;
  text-align: justify;
  line-height: 0.9;
}
.inner-comp {
  background-color: #fff;
  padding: 3% 4%;
  border: solid 1px #999;
  border-radius: 15px;
  width:100%;
  column-count: 2;
}
</style>
