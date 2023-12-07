<script setup lang="ts">
import { defineProps, ref } from "vue";

import { storeToRefs } from "pinia";
import { useUserStore } from "../../stores/user";
import { fetchy } from "../../utils/fetchy";

const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["collections", "headerText", "canEdit"]);
const collections = props.collections;
const canEdit = props.canEdit; 
const username = collections[0] ? collections[0].owner : undefined;

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

const deleteCollection = async (collection_id: string, event: Event) => {
  event.preventDefault();
  if (confirm("Are you sure you want to delete the Collection?")) {
    let query = { _id: collection_id };
    await fetchy(`/api/collections/${collection_id}`, "DELETE", { query });
    window.history.go(); //refresh page
  }
};
</script>

<template>
  <div>
    <h3>{{ $props.headerText }}</h3>
    <div class="collections-container">
      <RouterLink v-for="collection in collections" :key="collection._id" style="text-decoration: none" :to="{ name: 'Collection', params: { id: collection._id } }">
        <div :key="collection._id" class="collection-block">
          <div class="collection-info">
            <span class="title">{{ collection.title }}</span>
            <div class="song-owner">
              {{ collection.songifiedNotes.length }} Songs <br />By {{ collection.owner }}
              <button class="trash" v-if="canEdit" @click="deleteCollection(collection._id, $event)">🗑️</button>
            </div>
            <p>
              <span class="description">{{ collection.description }}</span>
            </p>
          </div>
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
.trash {
  border-radius: 5px;
  font-size: 20px;
  padding: 0.25em;
  margin-right: 0.5em;
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
  position: relative;
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

.song-owner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Adjust as needed to create space between the line and the trash icon */
  margin-bottom: 10px;
}

.trash {
  border-radius: 5px;
  font-size: 18px;
  padding: 0.25em;
  margin-right: 0.5em;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  transition: color 0.3s ease-in-out;
}

.trash:hover {
  background-color: #db5c5c;
}
</style>
