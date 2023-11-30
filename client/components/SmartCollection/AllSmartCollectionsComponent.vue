<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

interface SmartCollection {
  _id: string;
  collectionName: string;
  collectionTopic: string;
  collectionTags: string[];
  containedPosts: string[];
}
const allSmartCollections = ref<SmartCollection[]>([]);

const collectionContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick(); // Wait until the DOM updates

  const blocks = collectionContainer.value?.querySelectorAll(".smart-collection-block");

  blocks?.forEach((block) => {
    const randomColor1 = "#" + Math.floor(Math.random() * 16777215).toString(16);
    (block as HTMLElement).style.border = `1px solid ${randomColor1}`;
  });
});
</script>

<template>
  <div v-if="allSmartCollections">
    <div ref="collectionContainer" class="smart-collection-container">
      <router-link v-for="collection in allSmartCollections" :key="collection._id" :to="'/smartcollection/' + collection.collectionName" class="smart-collection-block">
        <h4>{{ collection.collectionTopic }}</h4>
        <div class="smart-collection-tags">
          <span v-for="tag in collection.collectionTags.slice(0, 3)" :key="tag" class="smart-tag">{{ tag }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.smart-collection-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.smart-collection-block {
  background-size: 100% 100%;
}

.smart-collection-block:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
