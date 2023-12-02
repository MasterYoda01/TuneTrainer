<script setup lang="ts">
import { defineProps, computed } from "vue";

interface SongifiedNoteType {
  backgroundMusicLink: string;
  generatedLyrics: string;
  // Add other properties of songifiedNote here
}

const props = defineProps({
  songifiedNote: Object as () => SongifiedNoteType,
});

// Computed property to get the full path of the MP3 file
const audioSrc = computed(() => {
  if (!props.songifiedNote?.backgroundMusicLink) return "";
  return new URL(`${props.songifiedNote.backgroundMusicLink}`, import.meta.url).href;
});
</script>

<template>
  <div>
    <!-- Audio Player -->
    <p v-if="songifiedNote">{{ songifiedNote.generatedLyrics }}</p>
    <audio v-if="audioSrc" controls :src="audioSrc" type="audio/mpeg">Your browser does not support the audio element.</audio>
  </div>
</template>

<style scoped></style>
