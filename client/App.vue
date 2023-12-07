<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, currentUsername } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <div class="app-container">
    <header v-if="isLoggedIn">
      <nav>
        <div class="nav-buttons">
          <!-- <p @click="$router.push({ name: 'Feed' })" :class="{ active: currentRouteName == 'Feed' }">SmartFeed</p> -->
          <p @click="$router.push({ name: 'Explore' })" :class="{ active: currentRouteName == 'Explore' }">Explore</p>
          <p @click="$router.push({ name: 'Collections', params: { user: currentUsername } })" :class="{ active: currentRouteName == 'Collections' }">Collections</p>
          <p @click="$router.push({ name: 'StudyTool' })" :class="{ active: currentRouteName == 'StudyTool' }">Study Tool</p>
          <p @click="$router.push({ name: 'GenerateSong' })" :class="{ active: currentRouteName == 'GenerateSong' }">Generate Song</p>
          <p @click="$router.push({ name: 'Settings' })" :class="{ active: currentRouteName == 'Settings' }">Settings</p>
        </div>
      </nav>
      <article v-if="toast !== null" class="toast" :class="toast.style">
        <p>{{ toast.message }}</p>
      </article>
    </header>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>
<style scoped>
@import "./assets/toast.css";
.app-container {
  display: flex;
  flex-direction: column;
}

nav {
  width: 100%;
  padding: 1em;
  background-color: white;
  display: flex;
  justify-content: center; /* Center the nav contents */
}

.content {
  flex-grow: 1;
  width: 100%;
}

.nav-buttons {
  display: flex; /* Apply flex layout to nav buttons */
  text-align: right;
  margin-bottom: 2px;
}

.nav-buttons p {
  margin: 0 10px; /* Add horizontal spacing between menu items */
  padding: 0.5em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 15px;
  padding: 5px 9px;
}
.nav-buttons p:hover {
  background-color: #fff;
  border: solid 2px #5cb48c;
  border-radius: 8px;
  padding: 3px 7px;
}
.nav-buttons p.active {
  background-color: #5cb48c;
  color: #fff;
  border-radius: 8px;
}
</style>
