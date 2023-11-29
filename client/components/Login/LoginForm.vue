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
    void router.push({ name: "GenerateSong" });
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
          <input type="text" v-model.trim="password" id="aligned-password" placeholder="Password" required />
        </div>
        <div class="button-container">
          <button type="submit" class="login-button">Log In</button>
        </div>
        {{ errorMessage }}
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}

.pure-control-group{
  margin-bottom: -2%;
}

</style>
