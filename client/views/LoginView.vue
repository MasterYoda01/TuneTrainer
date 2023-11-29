<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
import { ref } from "vue";

const showRegister = ref(false);
</script>

<template>
  <main class="main-container">
    <div class="logo-container">
      <img src="../assets/images/tunetrainer_logo.png" alt="Social Media Logo" class="logo" />
    </div>
    <div class="sections">
      <div class="left-section">
        <h2 class="major-labels">Welcome to <span style="color:black">TuneTrainer</span></h2>
        <p class="emoji-text">🔍 Embrace Harmonic Learning</p>
        <p>Immerse in a unique space where study notes transform into catchy songs, replacing mundane learning methods. No traditional notes, just melodious memory aids!</p>

        <p class="emoji-text">🤖 Tailored Melodic Transformation</p>
        <p>Our cutting-edge AI personalizes your learning experience. Provide your study notes, choose a song template, and our AI crafts them into educational tunes, making you a melody master.</p>

        <p class="emoji-text">📅 Love a Learning Tune?</p>
        <p>Explore community-generated songs carefully complied into song collections.</p>
      </div>
      <div class="right-section">
        <div v-if="showRegister">
          <RegisterForm />
        </div>
        <div v-else>
          <LoginForm />
        </div>
        <hr />
        <button class="switch" @click="showRegister = !showRegister">
          {{ showRegister ? "Already have an account? Login" : "Create Account" }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.switch{
  background-color: #ccc;
  padding: 14px 20px;
  font-weight: 550;
  border-radius: 5px;
  margin: 0 -5em;
  font-family: 'Righteous', sans-serif;
}
.switch:hover{
  background-color: #5CB48C;
}
.main-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* padding: 0 0 0 8em; */
  background-color: #f0f2f5;
}
.sections {
  display: flex;
  flex-direction: row;
  padding: 0 7em;
}
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 80px;
}

.logo {
  width: 150px;
  height: auto;
}
.local-button {
  width: 50%;
  background-color: #ffe9d6;
  color: black;
  /* padding: 14px 20px; */
  margin: 8px 0;
  border: 1px solid black;
  border-color: black;
  font-weight: 550;
  border-radius: 5px;
}

.feature-list {
  list-style: disc;
  margin-top: 20px;
  /* padding-left: 20px; */
}

.left-section {
  border: 1px;
  margin-right: 2em;
  /* margin: 0 100px; */
}
.right-section {
  margin-top: 0em ;
  width: 48%;
  padding: 40px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.emoji-text {
  font-size: 24px;
  font-weight: 400;
}

.logo-top-center {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

hr {
  width: 70%;
  border: 0.4px solid #ccc;
  margin-top: 20px;
  margin-bottom: 30px;
}
</style>
