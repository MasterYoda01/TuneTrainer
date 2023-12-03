<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, defineProps, ref } from "vue";

const props = defineProps(["note"]);
const note = props.note;
const userStore = useUserStore();
const { isLoggedIn, currentUsername } = storeToRefs(userStore);

console.log(note);
const audioSrc = computed(() => {
  return new URL(`${note.backgroundMusicLink}`, import.meta.url).href;
});

const deleteNote = async () => {

}; 

const canEdit = ref<boolean>(note.author === currentUsername.value); 
console.log(canEdit.value, note.author, currentUsername.value);
</script>
<template>
    <div class="audio-container">
        <button v-if="canEdit" class="trash" @click="deleteNote()">🗑️ </button>
        <audio v-if="audioSrc" controls :src="audioSrc" type="audio/mpeg" id="music" preload="auto">
            Your browser does not support the audio element.
        </audio>
    </div>

    <div class="column-container">
    <section class="notes">
        {{ note.rawNote }}
    </section>
    <section class="lyrics">
        {{ note.generatedLyrics }}
    </section>
    </div>
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
.column-container{
    display: flex;
    gap: 3%;
}
.notes, .lyrics{
    background-color: #fff;
    border: solid 1px #999;
    border-radius: 15px;
    padding: 2% 2.5%;
    width: 50%;
}
.audio-container{
    text-align: right;
    margin-bottom: 2%;
}
.trash{
    border-radius: 5px;
    font-size: 20px;
    padding: 0.25em;
    margin-right: 0.5em;
}
</style>
