<script lang="ts">
import { defineProps, ref } from "vue";

const props = defineProps(["note"]);
const note = ref(props.note);
</script>
<template>
    <main class="container">
        {{ note }}
    </main>
</template>
<style scoped>
</style>