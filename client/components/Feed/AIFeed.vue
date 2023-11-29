<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const apiResponse = ref();
const todaysPost = ref("");

const getAIDailyPost = async () => {
  const response = await fetchy("/api/GenerateSong", "GET");
  apiResponse.value = response.dailyPostsAndMsgs;

  const today = new Date().toISOString().split("T")[0];
  const todayData = apiResponse.value.find((item: any) => item.date.startsWith(today));

  if (todayData) {
    todaysPost.value = todayData.postContent;
  }
};

onMounted(async () => {
  await getAIDailyPost();
});
</script>

<template>
  <div v-if="todaysPost" class="post-container">
    <div class="post-header">
      <img src="../../assets/images/ai.png" alt="Profile Picture" class="profile-pic" />
      <div class="post-info">
        <p class="name-link">Generate Song</p>

        <p class="date">{{ new Date().toISOString().split("T")[0] }}</p>
      </div>
    </div>
    <p class="post-content">{{ todaysPost }}</p>
  </div>
  <br />
</template>

<style scoped>
.post-container {
  border: 1.5px solid #d9cafa;
  background-color: #f6ffdd8a;
  padding: 16px;
  border-radius: 4px;
}
.post-header {
  display: flex;
}
.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
}
.post-info {
  display: flex;
  flex-direction: column;
}
.name-link {
  font-weight: 600;
  text-decoration: none;
  color: black;
  line-height: 0.1;
  margin-bottom: 0;
  margin-top: 5px;
}
.username {
  font-weight: 400;
  line-height: 0.1;
  margin-bottom: 3px;
  color: gray;
}
.date {
  font-weight: 400;
  color: darkgray;
  font-size: 12px;
  margin-bottom: 0px;
}
.post-content {
  margin-top: 12px;
}
</style>
