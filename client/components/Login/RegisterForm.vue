<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

const username = ref("");
const password = ref("");
const { createUser, loginUser, updateSession } = useUserStore();
const errorMessage = ref("");

async function register() {
  try {
    await createUser(username.value, password.value);
    await loginUser(username.value, password.value);
    await updateSession();
    void router.push({ name: "GenerateSong" });
  } catch (e) {
    console.log(e);
    errorMessage.value = "⚠️ Username already exists or not allowed";
  }
}
</script>

<template>
  <form class="pure-form pure-form-aligned" @submit.prevent="register">
    <span>{{ errorMessage }}</span>
    <fieldset>
      <div class="form-container">
        <div class="pure-control-group">
          <input v-model.trim="username" type="text" id="aligned-name" placeholder="Username" required />
        </div>
        <div class="pure-control-group">
          <input type="password" v-model.trim="password" id="aligned-password" placeholder="Password" required />
        </div>
        <br />
        <div class="button-container">
          <button type="submit" class="login-button">Register</button>
        </div>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
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
