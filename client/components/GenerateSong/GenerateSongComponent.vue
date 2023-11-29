<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const userNotes = ref("");
const apiResponse = ref("");
const errorMessage = ref("");
const loading = ref(false);
const lyricsTemplate =
  "Song - Ed Sheeran. Shape of You. The club isnt the best place to find a lover So the bar is where I go Me and my friends at the table doing shots Drinking fast and then we talk slow Come over and start up a conversation with just me And trust me I ll give it a chance now Take my hand, stop, put Van the Man on the jukebox And then we start to dance, and now I m singing like Girl, you know I want your love Your love was handmade for somebody like me Come on now, follow my lead I may be crazy, don t mind me Say, boy, let s not talk too much Grab on my waist and put that body on me Come on now, follow my lead Come, come on now, follow my leadl";

const submitNotes = async () => {
  errorMessage.value = "";
  loading.value = true;
  apiResponse.value = "";

  try {
    let rawNote = userNotes.value;
    let query = { rawNote, lyricsTemplate };

    const response = await fetchy(`/api/generate/songifiednote`, "POST", { query });
    apiResponse.value = response.songifiednote.generatedLyrics;
  } catch (error) {
    console.error("Error submitting notes:", error);
    errorMessage.value = "Failed to submit notes. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container">
    <div class="notes-container">
      <textarea v-model="userNotes" placeholder="Enter your notes here..." rows="10" class="notes-textarea"></textarea>
      <button class="submit-button" @click="submitNotes">Submit Notes</button>
      <span class="error-message">{{ errorMessage }}</span>
    </div>
    <div class="response-container">
      <div v-if="loading" class="loading-message">Generating the song...</div>
      <p class="response-text">{{ apiResponse }}</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  width: 100%;
  gap: 15px;
}

.notes-container,
.response-container {
  flex: 1;
  padding: 16px;
  border-radius: 4px;
  margin: 0 auto;
  background-color: white;
  border: 0.3px solid lightgray;
}

.notes-textarea {
  width: 100%;
  padding: 8px;
  border: 0.3px solid lightgray;
  border-radius: 4px;
  margin-bottom: 16px;
  resize: vertical;
}

.submit-button {
  padding: 8px 16px;
  border: 0.3px solid lightgray;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.response-text {
  white-space: pre-wrap;
}

.loading-message {
  color: blue;
  font-size: 1.2em;
}
</style>
