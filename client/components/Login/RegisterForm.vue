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
          <input type="text" v-model.trim="password" id="aligned-password" placeholder="Password" required />
        </div>
        <div class="button-container">
          <button type="submit" class="login-button">Register</button>
        </div>
        <p />
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
.pure-control-group{
  margin-bottom: -2%;
}

</style>
