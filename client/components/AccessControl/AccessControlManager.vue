<script setup lang="ts">
import { fetchy } from "@/utils/fetchy"; // TODO: make faster by saving collections and their accessors locally, and only calling fetch when updates are made...
import { computed, onBeforeMount, ref } from "vue";
type ContentIdentifier = { id: string; name: string };
const defaultContentIdentifier = { id: "", name: "" };

const props = defineProps(["contentId"]);
const emit = defineEmits(["deactivateAccessControlManagement"]);
const objectOfAccessControl = ref<ContentIdentifier>({ id: "", name: "N/A" }); // the id of the collection whose access is being controlled
const disableAccessControlButtons = ref<boolean>(true);

type userDescription = { username: string; _id: string };
type AccessControl = { usersWithExplicitAccess: userDescription[]; isPublic: boolean };

const accessControl = ref<AccessControl>({ isPublic: false, usersWithExplicitAccess: [] });

const accessControlStarter = computed(() => {
  void activateAccessManager(props.contentId);
  return props.contentId;
});

/**
 *
 * @param id id of the collection whose access is being managed
 */
async function userAllowedToModerateAccess(id: string): Promise<boolean> {
  return true;
}

/**
 * Helps with loading a ui element that allows the user to manage the access controls for a given piece of user content
 *
 * @param id the id of the collection whose access is being managed
 */
async function activateAccessManager(id: string) {
  if (id === undefined) return;
  const userCanModerate: boolean = await userAllowedToModerateAccess(id);
  if (!userCanModerate) return;
  if (id.length === 0) {
    disableAccessControlButtons.value = true; // make a computed value.
    return;
  }
  disableAccessControlButtons.value = false;

  objectOfAccessControl.value.id = id;
  try {
    objectOfAccessControl.value.name = (await fetchy(`/api/collections/${id}`, "GET")).title; // [UX] TODO: when the database updates, re-perform this call! e.g. if you update the name of the collection in access controls
    await syncUsersWithAccess();
  } catch (_) {
    return;
  }
}

type AccessRequestInput = {
  subject: string; // the username of the person being granted access to an item of user content
  object: string; // the id of the content
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
    await syncUsersWithAccess();
  } catch (_) {
    return;
  }
}

async function makePublic() {
  try {
    await fetchy(`/api/collection_access_controls/publicCollections/${objectOfAccessControl.value.id}`, "PUT");
    await syncUsersWithAccess();
  } catch (_) {
    return;
  }
}

async function makeRestricted() {
  try {
    await fetchy(`/api/collection_access_controls/publicCollections/${objectOfAccessControl.value.id}`, "DELETE");
    await syncUsersWithAccess();
  } catch (_) {
    return;
  }
}

async function syncUsersWithAccess() {
  try {
    const response = await fetchy(`/api/collection_access_controls/${objectOfAccessControl.value.id}`, "GET");
    accessControl.value = { usersWithExplicitAccess: response.usersWithExplicitAccess, isPublic: response.isPublic };
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
    await fetchy(`/api/collection_access_controls/users/${subjectId}/accessibleContent/${requestedAccessControl.object}`, "DELETE"); // TODO: display state of user access (whether they have it or not)
  } catch (_) {
    return;
  }
  await syncUsersWithAccess();
}

const subjectOfAccessControlName = ref<string>(""); // the username of the user whose access is being changed

onBeforeMount(async () => {
  await activateAccessManager(props.contentId); // TODO: Catch error from server when not logged in
});
</script>

<template>
  <v-dialog width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" text="Share"> </v-btn>
      <!--TODO: button should display summary of share status (restricted, public, private)-->
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <div class="access-controler-content">
          <div class="field">
            <h1 class="collectionObjectName">
              Share "<b>{{ objectOfAccessControl.name }}</b
              >"
            </h1>

            <label>
              Add a user:
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

          <!--show current state-->
          <div class="peopleWithAcces">
            <h3>People with Access:</h3>
            <ul>
              <li v-for="user in accessControl.usersWithExplicitAccess" :key="user._id">
                <div class="access-user">
                  <p>{{ user.username }}</p>
                  <v-btn color="red-lighten-4" v-bind:disabled="disableAccessControlButtons" @click="() => removeSubjectAccessToObject({ subject: user.username, object: objectOfAccessControl.id })">
                    Remove
                  </v-btn>
                </div>
              </li>
            </ul>
          </div>
          <div class="general_access">
            <h3>General access:</h3>
            <p>Is Public? {{ accessControl.isPublic }}</p>
            <div class="options_for_general_access">
              <span>
                <v-btn color="teal-lighten-3" v-bind:disabled="disableAccessControlButtons" @click="() => makePublic()"> Allow anyone with link </v-btn>
                <v-btn color="teal-lighten-1" v-bind:disabled="disableAccessControlButtons" @click="() => makeRestricted()"> Restrict to people with access </v-btn>
              </span>
            </div>
          </div>
        </div>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="Back>"
            @click="
              () => {
                isActive.value = false;
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

.access-controler-content {
  padding: 2rem;
}

.access-user {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 1rem;
  width: 100%;
}

.access-widget {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 1rem;
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
