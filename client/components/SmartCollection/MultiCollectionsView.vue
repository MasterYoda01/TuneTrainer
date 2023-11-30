<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";

import { fetchy } from "../../utils/fetchy";

const props = defineProps(["collections"]);
const collections = props.collections;

const collectionIdParam = ref("");
const songIdParam = ref("");

interface SongCollectionDoc {
  _id: string;
  title: string;
  description: string;
  songifiedNotes: string[]; // Replace with the correct type if not string
  owner: string; // Replace with the correct type if not string
  upvotes: number;
}

const userCollections = ref<SongCollectionDoc[]>([]);
//PROMI -- use this function to make add new collection feature


// we will need this later in the code where a single collection is rendered
async function addSongToCollection() {
  try {
    let collectionId = collectionIdParam.value;
    let songId = songIdParam.value;

    const response = await fetchy(`/api/collection/add/`, "PATCH", {
      body: {
        collection_id: collectionId,
        songifiedNoteToAdd: songId,
      },
    });

    alert(`Song added to collection: ${response.msg}`);
    // Handle response or update UI accordingly
  } catch (error) {
    alert("Error adding song to collection");
  }
}

//PROMI -- this function gets all the user's collections
const getUsersCollections = async () => {
  
};

onMounted(async () => {
  await getUsersCollections();
});
</script>

<template>
  <div>
    <h3>My Collections</h3>
    <div class="collections-container">
      <div v-for="collection in collections" :key="collection._id" class="collection-block">
        <h5>{{ collection.title }}</h5>
        <p>{{ collection.description }}</p>
        <p>Number of Songs: {{ collection.songifiedNotes.length }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smart-collection-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.collections-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.collection-block {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 5px;
  width: 250px; /* Adjust width as needed */
}

.collection-block:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.smart-collection-block {
  border: 1px solid #ccc;
}

.smart-collection-block:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
