<script setup lang="ts">
import { defineProps, computed } from "vue";

const props = defineProps({
  songifiedNote: Object,
});

// Computed property to get the full path of the MP3 file
const audioSrc = computed(() => {
  return new URL(`${props.songifiedNote.backgroundMusicLink}`, import.meta.url).href;
});
</script>

<template>
  <div>
    <!-- Audio Player -->
    <p>{{ songifiedNote.generatedLyrics }}</p>
    <audio controls :src="audioSrc" type="audio/mpeg">Your browser does not support the audio element.</audio>
  </div>
</template>

<style scoped>
/* You can add styles for your audio player here */
</style>
