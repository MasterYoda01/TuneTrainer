import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";

import FeedView from "../views/FeedView.vue";
import GenerateSongView from "../views/GenerateSong.vue";
import LoginView from "../views/LoginView.vue";
import SettingView from "../views/SettingView.vue";
import SingleSmartCollectionView from "../views/SingleSmartCollectionView.vue";
import SmartCollectionsView from "../views/SmartCollectionsView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/feed",
      name: "Feed",
      component: FeedView,
      meta: { requiresAuth: true, breadcrumb: "Feed" },
    },
    {
      path: "/GenerateSong",
      name: "GenerateSong",
      component: GenerateSongView,
      meta: { requiresAuth: true, breadcrumb: "GenerateSong" },
    },
    {
      path: "/collections/user=:user",
      name: "Collections",
      component: SmartCollectionsView,
      meta: { requiresAuth: true, breadcrumb: "Collections" },
    },
    {
      path: "/smartcollection/:collectionname",
      name: "SmartCollection",
      component: SingleSmartCollectionView,
      meta: { requiresAuth: true, breadcrumb: "SmartCollection" },
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
          return { name: "Feed" };
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
