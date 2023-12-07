<script setup lang="ts">
import router from "@/router";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const titleParam = ref("");
const descriptionParam = ref("");
const loaded = ref(true);

async function createCollection() {
  loaded.value = false; 
  let title = titleParam.value;
  let description = descriptionParam.value;

  let query = { title, description };

  const response = await fetchy(`/api/create/collection`, "POST", { query });
  void router.push({ name: "Collection", params: { id: response.collection._id } });
}
</script>

<template>
  <div>
    <h3>Create New Collection</h3>
    <form @submit.prevent="createCollection">
      <input v-model="titleParam" type="text" placeholder="Title" required />
      <input v-model="descriptionParam" type="text" placeholder="Description" required />
      <button v-if="loaded" @click=createCollection()>Create</button>
    </form>
  </div>
</template>
<style scoped>
h3{
  font-family: Arial, Helvetica, sans-serif;
  margin: 0.5em 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 16px;
}
input{
  background-color: #fff;
  border: solid 2px #999;
}
form button{
  float: right;
  padding: 4px 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 16px;
  border: solid 1px #5cb48c;
  
}
</style>
