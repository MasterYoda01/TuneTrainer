<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
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
          <p @click="$router.push({ name: 'Collections' })" :class="{ active: currentRouteName == 'Collections' }">Collections</p>
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
  align-items: center; /* Align items vertically */
}

.nav-buttons p {
  margin: 0 10px; /* Add horizontal spacing between menu items */
  padding: 0.5em;
}

.nav-buttons p:hover,
.nav-buttons p.active {
  background-color: #f0f2f5;
}
</style>
