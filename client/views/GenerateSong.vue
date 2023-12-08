<script setup lang="ts">
import GenerateSongComponent from "@/components/GenerateSong/GenerateSongComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../utils/fetchy";

const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);

const collections = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);
const collectionMode = ref(false);
const collectionTitle = ref("");
const collectionDesc = ref("");

const getUsersCollections = async () => {
  try {
    const response = await fetchy(`/api/users/${currentUsername.value}/collections`, "GET", {});
    console.log("user collection", response);
    collections.value = response;
  } catch (error) {
    console.error("Error getting collection notes:", error);
  } finally {
    loaded.value = true;
  }
};

onBeforeMount(async () => {
  await getUsersCollections();
});

const createCollection = async () => {
  collectionMode.value = false;
  try {
    let query = { title: collectionTitle.value, description: collectionDesc.value };
    const response = await fetchy(`/api/create/collection`, "POST", { query });
    console.log(response);
    collections.value.push(response.collection);
  } catch (e) {
    console.log(e);
  }
};

const toggleMode = async () => {
  if (collectionMode.value) {
    collectionMode.value = false;
  } else {
    collectionMode.value = true;
  }
};
</script>

<template>
  <main class="container">
    <h2 class="major-labels">Generate <span style="color: #000">Song</span></h2>
    <GenerateSongComponent v-if="loaded" :collections="collections" :class="{ active: collectionMode }" />
    <button @click="toggleMode()" v-if="!collectionMode" style="float: right" class="collection-button">New Collection</button>
    <section class="create-collection" v-else>
      <button @click="toggleMode()" class="cancel-button">Cancel</button>
      <button @click="createCollection()" class="collection-button">Create Collection</button>

      <input v-model="collectionTitle" type="text" placeholder="Title" required style="margin-top: 2em" />
      <input v-model="collectionDesc" type="text" placeholder="Description" required />
    </section>
  </main>
</template>

<style scoped>
.cancel-button {
  color: #999;
  border-radius: 5px;
  padding: 0px 15px;
  border: none;
}
.cancel-button:hover {
  color: #000;
  border: none;
}
h1 {
  text-align: center;
}
.major-labels {
  margin-bottom: 2%;
}

.collection-button {
  padding: 10px 2.5%;
  padding-left: 1.5%;
  border: solid 2px #5cb48c;
  border-radius: 5px;
  margin-top: 1em;
  background-color: #fff;
  color: #5cb48c;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 15px;
}
.collection-button:hover {
  background-color: #5cb48c;
  color: #fff;
}

.active {
  opacity: 10%;
  height: 10%;
}
input {
  background-color: #fff;
  border: solid 1.5px #000;
  border-radius: 15px;
  margin-bottom: 0;
}
.create-collection {
  margin-top: 1em;
  margin-bottom: 5em;
  text-align: right;
}
</style>
