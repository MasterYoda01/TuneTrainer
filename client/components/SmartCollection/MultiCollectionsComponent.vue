<script setup lang="ts">
import { defineProps, ref } from "vue";

import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["collections"]);
const collections = props.collections;
const username = collections[0].owner; 

console.log(collections, "MCC");

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

// // we will need this later in the code where a single collection is rendered
// async function addSongToCollection() {
//   try {
//     let collectionId = collectionIdParam.value;
//     let songId = songIdParam.value;

//     const response = await fetchy(`/api/collection/add/`, "PATCH", {
//       body: {
//         collection_id: collectionId,
//         songifiedNoteToAdd: songId,
//       },
//     });

//     alert(`Song added to collection: ${response.msg}`);
//     // Handle response or update UI accordingly
//   } catch (error) {
//     alert("Error adding song to collection");
//   }
// }

</script>

<template>
  <div>
    <h3>Collections</h3>
    <div class="collections-container">
      <RouterLink v-for="collection in collections" :key="collection._id" style="text-decoration: none" :to="{ name: 'SmartCollection', params: { id: collection._id } }">
        <div :key="collection._id" class="collection-block">
          <span class="title">{{ collection.title }}</span>
          {{ collection.songifiedNotes.length }} Songs
          <br>By {{ collection.owner }}
          <p>
            <span class="description">{{ collection.description }}</span>
          </p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-family: "Arial";
  font-weight: 600;
  text-transform: uppercase;
}
.smart-collection-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.title {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  color: #5cb48c;
}
.description {
  color: #999;
}
.collections-container {
  column-count: 3;
  column-gap: 2em;
  margin: 5px 0;
  flex-wrap: nowrap;
}

.collections-container .collection-block {
  break-inside: avoid-column;
}
.collection-block {
  border: 1px solid #999;
  color: #000;
  background-color: #fff;
  border-radius: 5px;
  padding: 4% 5%;
  flex-wrap: wrap;
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
