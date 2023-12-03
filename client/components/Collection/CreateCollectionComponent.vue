<script setup lang="ts">
import router from "@/router";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const titleParam = ref("");
const descriptionParam = ref("");

async function createCollection() {
  
  let title = titleParam.value;
  let description = descriptionParam.value;

  let query = { title, description };

  const response = await fetchy(`/api/create/collection`, "POST", { query });
  void router.push({ name: "Collection", params: {id: response._id} });

  //alert(`Collection created: ${response.msg}`);
  // Refresh collections list or handle response
  
}
</script>

<template>
  <div>
    <h3>Create New Collection</h3>
    <form @submit.prevent="createCollection">
      <input v-model="titleParam" type="text" placeholder="Title" required />
      <input v-model="descriptionParam" type="text" placeholder="Description" required />
      <button type="submit">Create</button>
    </form>
  </div>
</template>
<style scoped></style>
