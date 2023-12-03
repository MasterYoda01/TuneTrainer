<script setup lang="ts">
import { computed, defineProps } from "vue";

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
  <section class="inner-comp">
    <!-- Audio Player -->
    <div v-if="songifiedNote" class="lyrics">{{ songifiedNote.generatedLyrics }}</div>
    <audio v-if="audioSrc" controls :src="audioSrc" type="audio/mpeg" id="music" preload="auto">
      Your browser does not support the audio element.
    </audio>
  </section>
</template>

<style scoped>
.lyrics{
  font-size: 18px;
  width: 75%;
  border-right: solid 2px #999;
  margin-right: 4%;
  text-align: justify;
  padding-right: 4%;
}
.inner-comp{
  background-color: #fff;
  padding: 3% 4%;
  border: solid 1px #999;
  border-radius: 15px;
  display: flex;
}
.inner-comp::hover{
  background-color: #5cb48c;
}
</style>
