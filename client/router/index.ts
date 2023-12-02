import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";

import CollectionsView from "../views/CollectionsView.vue";
import GenerateSongView from "../views/GenerateSong.vue";
import LoginView from "../views/LoginView.vue";
import SettingView from "../views/SettingView.vue";
import SingleCollectionView from "../views/SingleCollectionView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/generatesong",
      name: "GenerateSong",
      component: GenerateSongView,
      meta: { requiresAuth: true, breadcrumb: "GenerateSong" },
    },
    {
      path: "/collections/user=:user",
      name: "Collections",
      component: CollectionsView,
      meta: { requiresAuth: true, breadcrumb: "Collections" },
    },
    {
      path: "/Collection/id=:id",
      name: "Collection",
      component: SingleCollectionView,
      meta: { requiresAuth: true, breadcrumb: "Collection" },
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true, breadcrumb: "Settings" },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Collections" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: LoginView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.path === "/") {
    return isLoggedIn.value ? { name: "Feed" } : { name: "Login" };
  }

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
