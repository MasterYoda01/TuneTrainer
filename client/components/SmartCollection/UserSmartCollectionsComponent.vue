<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const userStore = useUserStore();

interface SmartCollection {
  _id: string;
  collectionName: string;
  collectionTopic: string;
  collectionTags: string[];
  containedPosts: string[];
}

const userSmartCollections = ref<SmartCollection[]>([]);

const { currentUsername } = storeToRefs(userStore);

async function getUserSmartCollections() {
  const smartcollections = await fetchy(`/api/smartcollection/following/${currentUsername.value}`, "GET", {});
  userSmartCollections.value = smartcollections;
}

onMounted(async () => {
  await getUserSmartCollections();
});
</script>

<template>
  <div>
    <h3>Followed Collections</h3>
    <div class="smart-collection-container">
      <router-link v-for="collection in userSmartCollections" :key="collection._id" :to="'/smartcollection/' + collection.collectionName" class="smart-collection-block">
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
  border: 1px solid #ccc;
}

.smart-collection-block:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
