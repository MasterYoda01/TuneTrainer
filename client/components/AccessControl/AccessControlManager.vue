<script setup lang="ts">
import { fetchy } from "@/utils/fetchy"; // TODO: make faster by saving recipes and their accessors locally, and only calling fetch when updates are made...
import { computed, onBeforeMount, ref } from "vue";
type ContentIdentifier = { id: string; name: string };
const defaultContentIdentifier = { id: "", name: "" };

const props = defineProps(["contentId"]);
const emit = defineEmits(["deactivateAccessControlManagement"]);
const objectOfAccessControl = ref<ContentIdentifier>({ id: "", name: "(Press 'Manage access controls' on the desired collection)" }); // the id of the recipe whose access is being controlled
const disableAccessControlButtons = ref<boolean>(true);

const accessControlStarter = computed(() => {
  void activateAccessManager(props.contentId);
  return props.contentId;
});
/**
 * Helps with loading a ui element that allows the user to manage the access controls for a given piece of user content
 *
 * @param id the id of the recipe whose access is being managed
 */
async function activateAccessManager(id: string) {
  objectOfAccessControl.value.id = id;
  if (id.length === 0) {
    disableAccessControlButtons.value = true; // make a computed value.
    return;
  }
  disableAccessControlButtons.value = false;
  try {
    objectOfAccessControl.value.name = (await fetchy(`/api/collections/${id}`, "GET")).dishName; // [UX] TODO: when the database updates, re-perform this call! e.g. if you update the name of the recipe in access controls
  } catch (_) {
    return;
  }
}

function disactivateAccessManager() {
  disableAccessControlButtons.value = true; // make a computed value.
  objectOfAccessControl.value = defaultContentIdentifier; // make disabling of buttons computed so it updates in response to this change
}

type AccessRequestInput = {
  subject: string; // the username of the person being granted access to an item of user content
  object: string; // the id of the recipe
};
async function grantSubjectAccessToObject(requestedAccessControl: AccessRequestInput) {
  // convert the subjectName to an id
  let subjectId: string = "";
  try {
    const subjectInfo = await fetchy(`/api/users/${requestedAccessControl.subject}`, "GET");
    subjectId = subjectInfo._id;
    subjectOfAccessControlName.value = "";
  } catch (_) {
    return;
  }

  try {
    await fetchy(`/api/collection_access_controls/users/${subjectId}/accessibleContent`, "PUT", { body: { contentId: requestedAccessControl.object } }); // TODO: display state of user access (whether they have it or not)
  } catch (_) {
    return;
  }
}

async function removeSubjectAccessToObject(requestedAccessControl: AccessRequestInput) {
  // convert the subjectName to an id
  let subjectId: string = "";
  try {
    const subjectInfo = await fetchy(`/api/users/${requestedAccessControl.subject}`, "GET");
    subjectId = subjectInfo._id;
    subjectOfAccessControlName.value = "";
  } catch (_) {
    return;
  }

  try {
    await fetchy(`/api/recipe_access_controls/users/${subjectId}/accessibleContent/${requestedAccessControl.object}`, "DELETE"); // TODO: display state of user access (whether they have it or not)
  } catch (_) {
    return;
  }
}

const subjectOfAccessControlName = ref<string>(""); // the username of the user whose access is being changed

onBeforeMount(async () => {
  await activateAccessManager(props.contentId); // TODO: Catch error from server when not logged in
});
</script>

<template>
  <v-dialog width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" text="Grant access to certain users"> </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card title="User Permissions">
        <div class="field">
          <p class="recipeObjectName">
            Recipe: <b>{{ objectOfAccessControl.name }}</b>
          </p>

          <label>
            User whose access you want to manage:
            <v-text-field label="Username" v-model="subjectOfAccessControlName" />
          </label>
        </div>
        <v-btn
          color="teal-lighten-3"
          v-bind:disabled="disableAccessControlButtons"
          @click="() => grantSubjectAccessToObject({ subject: subjectOfAccessControlName, object: objectOfAccessControl.id })"
        >
          Grant access
        </v-btn>
        <v-btn
          color="red-lighten-4"
          v-bind:disabled="disableAccessControlButtons"
          @click="() => removeSubjectAccessToObject({ subject: subjectOfAccessControlName, object: objectOfAccessControl.id })"
        >
          Remove access
        </v-btn>
        <!--show current state-->

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="Back>"
            @click="
              () => {
                isActive.value = false;
                objectOfAccessControl = defaultContentIdentifier; // make disabling of buttons computed so it updates in response to this change
              }
            "
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped>
.accessControlManager {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.accessControlManager .popup-content {
  background-color: #081c33;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 768px;
  max-height: 75vh;
  overflow-y: auto;
}
.popup-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
</style>
