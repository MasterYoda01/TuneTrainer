<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  const confirmed = window.confirm("Are you sure you want to log out?");
  if (confirmed) {
    await logoutUser();
    void router.push({ name: "Login" });
  }
}

async function delete_() {
  const confirmed = window.confirm("Are you sure you want to delete your account?");
  if (confirmed) {
    await deleteUser();
    void router.push({ name: "Login" });
  }
}
</script>

<template>
  <main>
    <h3 class="global-title">Settings for {{ currentUsername }}</h3>
    <section class="global-page-layout">
      <UpdateUserForm />
      <br />
      <div class="account-actions">
        <button class="global-button-blue" @click="logout">Logout</button>
        <button class="global-button global-button-red-border" @click="delete_">Delete Account</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.account-actions {
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-top: 20px;
}
</style>
