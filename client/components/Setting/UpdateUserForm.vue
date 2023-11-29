<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { validateInput, validateName } from "@/utils/validators";
import { ref } from "vue";

const picture = ref("");
const fileInput = ref(null);
const username = ref("");
const password = ref("");
const fullname = ref("");
const errorMessage = ref("");
const bio = ref("");
const { updateUser, updateSession } = useUserStore();

function performValidation(inputText: string, field: string) {
  let isValid = false;
  let message = "";

  switch (field) {
    case "Full name":
      ({ isValid, message } = validateName(inputText));
      break;
    default:
      ({ isValid, message } = validateInput(inputText));
      break;
  }

  if (!isValid) {
    errorMessage.value = `${field}: ${message}`;
  }

  return isValid;
}

async function updateUsername() {
  await updateUser({ username: username.value });
  await updateSession();
  username.value = "";
}

async function updatePassword() {
  await updateUser({ password: password.value });
  await updateSession();
  password.value = "";
}
</script>

<template>
  <h2>Update account details</h2>
  <span>{{ errorMessage }}</span>

  <form @submit.prevent="updateUsername" class="pure-form">
    <fieldset>
      <legend>Change your username</legend>
      <div class="field">
        <input type="text" placeholder="New username" v-model="username" required />
        <button v-if="username" type="submit" class="btn-small global-button-blue">Update username</button>
      </div>
    </fieldset>
  </form>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <div class="field">
        <input type="password" placeholder="New password" v-model="password" required />
        <button v-if="password" type="submit" class="btn-small global-button-blue">Update password</button>
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>
