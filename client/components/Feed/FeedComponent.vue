<script setup lang="ts">
import AIFeed from "@/components/Feed/AIFeed.vue";
import { fetchy } from "@/utils/fetchy";
import { validateInput } from "@/utils/validators";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
const inputValue = ref("");

let posts = ref<Array<Record<string, string>>>([]);
const errorMessage = ref("");

async function updateFeedPreference() {
  loaded.value = false;
  let userQuery = inputValue.value;

  let query: Record<string, string> = { userQuery };
  try {
    const response = await fetchy("/api/smartfeed/update", "POST", { query });
    posts.value = response;
  } catch (error) {
    console.error(error);
  } finally {
    errorMessage.value = "";
    loaded.value = true;
  }
}

async function getFeed() {
  try {
    const response = await fetchy("/api/smartfeed", "GET");
    posts.value = response;
  } catch (error) {
    console.error(error);
  }
}
async function resetFeed() {
  try {
    await fetchy("/api/smartfeed/reset", "POST");
    await getFeed();
  } catch (error) {
    console.error(error);
  }
}

function performValidation() {
  const { isValid, message } = validateInput(inputValue.value);
  if (!isValid) {
    errorMessage.value = isValid ? "" : message;
  }
  return isValid;
}

onBeforeMount(async () => {
  await getFeed();
  loaded.value = true;
});
</script>

<template>
  <div>
    <div class="feed-personalization">
      <div class="header-and-reset">
        <h3 class="personalize-header">Personalize SmartFeed</h3>
        <button class="reset-btn" @click="resetFeed">Reset to default</button>
      </div>

      <div class="input-container">
        <input v-model="inputValue" placeholder="Personalize your feed: e.g., 'Don't show AI-related posts'" required />
        <button class="global-button-blue local-btn" @click="performValidation() && updateFeedPreference()">Submit</button>
      </div>
      <span class="error-message">{{ errorMessage }}</span>
    </div>
    <h3>Recent Posts</h3>

    <section class="feed-container" v-if="loaded && posts.length !== 0">
      <div class="feed-preference"></div>
      <AIFeed />
    </section>
    <p v-else-if="loaded">No posts found</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
.feed-preference {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
  width: 1rem;
}

.feed-personalization {
  display: flex;
  flex-direction: column;
}

.feed-container {
  margin: 0 auto;
}

.header-and-reset {
  display: flex;
  flex-direction: row;
}
.reset-btn {
  background: transparent;
  border: none;
  padding: 0;
  color: rgb(158, 6, 6);
  text-decoration: underline;
  font-size: 14px;
}

.personalize-header {
  width: 85%;
}
.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 1em;
}

.local-btn {
  margin-top: 0;
  padding: 15px 20px 15px;
  font-size: 1rem;
  border-radius: 4px;
}

.post {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 1em;
  margin-bottom: 1em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.post-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.post-author {
  color: #888;
  font-size: 0.9rem;
}

.post-content {
  margin-top: 0.5em;
}

p {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 1em;
}

input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
