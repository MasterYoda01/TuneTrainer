<script setup lang="ts">
import { onMounted, ref } from "vue";

import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);

const userNotes = ref("");
const apiResponse = ref("");
const errorMessage = ref("");
const loading = ref(false);
interface SongCollectionDoc {
  _id: string;
  title: string;
  description: string;
  songifiedNotes: string[]; // Replace with the correct type if not string
  owner: string; // Replace with the correct type if not string
  upvotes: number;
}

const userCollections = ref<SongCollectionDoc[]>([]);

const editMode = ref(false); //some buttons should NOT be visible before and after lyrics generation
const chosenTemplate = ref("");

// DEFAULT FOR DEBUGGING:
const lyricsTemplate =
  "Song - Ed Sheeran. Shape of You. The club isnt the best place to find a lover So the bar is where I go Me and my friends at the table doing shots Drinking fast and then we talk slow Come over and start up a conversation with just me And trust me I ll give it a chance now Take my hand, stop, put Van the Man on the jukebox And then we start to dance, and now I m singing like Girl, you know I want your love Your love was handmade for somebody like me Come on now, follow my lead I may be crazy, don t mind me Say, boy, let s not talk too much Grab on my waist and put that body on me Come on now, follow my lead Come, come on now, follow my leadl";

const submitNotes = async () => {
  // editMode.value = true;
  // errorMessage.value = "";
  // loading.value = true;
  // apiResponse.value = "";
  // try {
  //   let rawNote = userNotes.value;
  //   let query = { rawNote, lyricsTemplate };
  //   const response = await fetchy(`/api/generate/songifiednote`, "POST", { query });
  //   apiResponse.value = response.songifiednote.generatedLyrics;
  // } catch (error) {
  //   console.error("Error submitting notes:", error);
  //   errorMessage.value = "Failed to submit notes. Please try again.";
  // } finally {
  //   loading.value = false;
  // }
};

//PROMI -- this function gets all the user's collections
const getUsersCollections = async () => {
  try {
    const response = await fetchy(`/api/collections/${currentUsername.value}`, "GET", {});
    console.log(response);
    userCollections.value = response;
  } catch (error) {
    console.error("Error getting collection notes:", error);
  }
};

onMounted(async () => {
  await getUsersCollections();
});

const changeTemplate = async () => {
  chosenTemplate.value = lyricsTemplate;
  //in an ideal world we do a request to load template, or have it loaded already
};
</script>

<template>
  <div class="column-container">
    <div class="notes-container">
      <textarea v-model="userNotes" placeholder="Enter your notes here..." rows="10" class="notes-textarea"></textarea>
      <section class="selection" v-if="!editMode">
        <button class="dropdown">
          Choose Tune
          <div class="template-dropdown">
            <button class="song-template" @click="changeTemplate()">Shape Of You</button>
          </div>
        </button>
        <button type="submit" @click="submitNotes">Submit Notes</button>
      </section>
      <span class="error-message">{{ errorMessage }}</span>
    </div>
    <div class="response-container">
      <div v-if="loading" class="loading-message">Generating the song...</div>
      <p class="response-text">{{ apiResponse }}</p>

      <select v-if="userCollections.length" class="collections-selector">
        <option v-for="collection in userCollections" :key="collection._id" :value="collection._id">
          {{ collection?.title }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.selection {
  display: flex;
  column-gap: 10px;
}
.dropdown {
  width: 100%;
  background-color: #fff;
  color: #5cb48c;
  border: solid 2px #5cb48c;
  padding: 14px 20px;
  margin: 8px 0;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 15px;
  position: relative;
  display: inline;
}
.column-container {
  display: flex;
  width: 100%;
  gap: 15px;
}

.template-dropdown {
  display: none;
  margin: 0 0 -20% -8%;
  background-color: #fff;
  border-radius: 5px;
  width: 100%;
  padding-bottom: 2%;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  position: absolute;
}
.dropdown:hover .template-dropdown {
  display: block;
}
.song-template {
  color: #999;
  border: 0;
  width: 100%;
  text-align: left;
  font-size: 20px;
  background: 0;
  padding: 3% 5%;
  border-bottom: solid 1px #999;
}
.song-template:hover {
  color: #5cb48c;
  border-color: #5cb48c;
  font-weight: 6000;
}

.notes-container,
.response-container {
  flex: 1;
  padding: 2% 2.5%;
  border-radius: 4px;
  margin: 0 auto;
  background-color: white;
  border: 1.5px solid #000;
  border-radius: 15px;
}

.notes-textarea {
  width: 97%;
  padding: 8px;
  border: 1px solid lightgray;
  border-radius: 9px;
  margin-bottom: 5px;
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
