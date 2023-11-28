<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";

import { ref } from "vue";

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const { loginUser, updateSession } = useUserStore();

async function login() {
  try {
    const logindata = await loginUser(username.value, password.value);
    console.log(logindata);
    await updateSession();
    void router.push({ name: "Feed" });
  } catch (error) {
    console.log("Login Error:", error);
    errorMessage.value = "⚠️ Username or password is incorrect";
  }
}
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="login">
    <fieldset>
      <div class="form-container">
        <div class="pure-control-group">
          <input v-model.trim="username" type="text" id="aligned-name" placeholder="Username" required />
        </div>
        <div class="pure-control-group">
          <input type="password" v-model.trim="password" id="aligned-password" placeholder="Password" required />
        </div>
        <div class="button-container">
          <button type="submit" class="login-button">Log In</button>
        </div>
        <p>{{ errorMessage }}</p>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button[type="submit"] {
  width: 100%;
  background-color: #d9cafa;
  color: black;
  padding: 14px 20px;
  margin: 8px 0;
  border: 1px solid black;
  border-color: black;
  font-weight: 550;
  border-radius: 5px;
}

button[type="submit"]:hover {
  background-color: #b69bee;
}
</style>
