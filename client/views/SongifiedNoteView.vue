<script lang="ts">
import { onBeforeMount, ref } from 'vue';
import SongifiedNoteComponent from '../components/SongifiedNote/SongifiedNoteComponent.vue';
import router from '../router';

const note_id = ref(router.currentRoute.value.params.id);
const note = ref<Record<string, string>>({}); 
const loaded = ref(false);

onBeforeMount( async() => {
    loaded.value = false;
    // try {
    //     console.log("what");

    //     note.value = await fetchy(`/api/collections/${collection_id.value}`, "GET", {});
    //     console.log(collection.value);
    // } catch (error) {
    //     console.log(error);
    // } finally {
    //     loaded.value = true;
    // }
}); 
</script>
<template>
    <h2>single note </h2>
    <SongifiedNoteComponent />
</template>
<style scoped></style>