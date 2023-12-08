<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy"; // TODO: make faster by saving collections and their accessors locally, and only calling fetch when updates are made...
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
type ContentIdentifier = { id: string; name: string };
const defaultContentIdentifier = { id: "", name: "" };

const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);

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
    await fetchy(`/api/collectionaccesscontrols/users/${subjectId}/accessibleContent`, "PUT", { body: { contentId: requestedAccessControl.object } }); // TODO: display state of user access (whether they have it or not)
    await syncUsersWithAccess();
  } catch (_) {
    return;
  }
}

async function makePublic() {
  try {
    await fetchy(`/api/collectionaccesscontrols/publiccollections/${objectOfAccessControl.value.id}`, "PUT");
    await syncUsersWithAccess();
  } catch (_) {
    return;
  }
}

async function makeRestricted() {
  try {
    await fetchy(`/api/collectionaccesscontrols/publiccollections/${objectOfAccessControl.value.id}`, "DELETE");
    await syncUsersWithAccess();
  } catch (_) {
    return;
  }
}

async function syncUsersWithAccess() {
  try {
    const response = await fetchy(`/api/whohascollectionaccess/${objectOfAccessControl.value.id}`, "GET");
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
    await fetchy(`/api/collectionaccesscontrols/users/${subjectId}/accessibleContent/${requestedAccessControl.object}`, "DELETE"); // TODO: display state of user access (whether they have it or not)
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
  <v-dialog width="600">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" text="Share"> </v-btn>
      <!--TODO: button should display summary of share status (restricted, public, private)-->
    </template>

    <template v-slot:default="{ isActive }">
      <v-card style="border-radius: 15px">
        <div class="access-controller-content">
          <div class="field">
            <div class="title-and-flag">
              <h1 class="collectionObjectName">
                Share "<b>{{ objectOfAccessControl.name }}</b
                >"
              </h1>
              <span class="public-flag" :class="{ true: accessControl.isPublic, false: !accessControl.isPublic }">
                {{ accessControl.isPublic ? "Public" : "Private" }}
              </span>
            </div>
            <label>
              <div class="header">Add a user:</div>
              <v-text-field label="Username" v-model="subjectOfAccessControlName" />
            </label>
          </div>
          <v-btn
            style="margin-top: -15px"
            v-bind:disabled="disableAccessControlButtons"
            @click="() => grantSubjectAccessToObject({ subject: subjectOfAccessControlName, object: objectOfAccessControl.id })"
          >
            Grant access
          </v-btn>

          <!--show current state-->
          <div class="peopleWithAcces">
            <div class="header">Users with Access:</div>
            <ul style="padding: 0 20px">
              <li v-for="user in accessControl.usersWithExplicitAccess" :key="user._id">
                <div class="access-user">
                  <p>{{ user.username }}</p>
                  <v-btn
                    v-bind:disabled="disableAccessControlButtons"
                    v-if="user.username !== currentUsername"
                    @click="() => removeSubjectAccessToObject({ subject: user.username, object: objectOfAccessControl.id })"
                  >
                    Remove
                  </v-btn>
                </div>
              </li>
            </ul>
          </div>
          <div class="general_access">
            <h3>General access:</h3>
            <div class="options_for_general_access">
              <span>
                <v-btn v-if="!disableAccessControlButtons" @click="() => makePublic()" :class="{ active: !accessControl.isPublic }">Public</v-btn>
                <v-btn v-if="!disableAccessControlButtons" @click="() => makeRestricted()" :class="{ active: accessControl.isPublic }">Private Access</v-btn>
              </span>
            </div>
          </div>
        </div>
        <v-btn
          text="Close"
          @click="
            () => {
              isActive.value = false;
            }
          "
          style="margin-top: 2em; font-weight: 600"
        />
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped>
h2 {
  font-size: 30px;
  text-transform: uppercase;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 600;
}
.header {
  margin-top: 15px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 15px;
}

.active {
  background-color: #5cb48c;
  color: #fff;
}
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

.access-controller-content {
  padding: 1em 2em;
}

li {
  margin-top: 0px;
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

.field label {
  display: block;
  margin-bottom: 1rem;
}

.v-btn {
  margin: 0.5rem 0; /* Space between buttons */
  padding: 0.5rem 1rem; /* Padding for buttons */
  border-radius: 5px; /* Rounded corners */
}

/* Styling for the isPublic flag */
.public-flag {
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  display: inline-block;
  color: white;
  font-weight: bold;
  margin: 0.5rem 0;
}

.public-flag.true {
  background-color: #4caf50; /* Green for true */
}

.public-flag.false {
  background-color: #f44336; /* Red for false */
}

/* Additional Styling for Access User */
.access-user p {
  margin-right: 1rem; /* Space between username and button */
}

/* General Access Section */
.general_access {
  margin-top: 1rem;
}

.options_for_general_access span {
  display: flex;
  flex-direction: column; /* Stack buttons vertically */
}

/* Card Actions */
.v-card-actions {
  padding: 1rem;
}

.title-and-flag {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collectionObjectName {
  font-size: 1.5rem;
  flex-grow: 1;
  margin-right: 1rem;
}

.public-flag {
  padding: 0.2rem 0.4rem;
  font-size: 0.9rem; /* Smaller font size for flag */
  border-radius: 5px;
  display: inline-block;
  color: white;
  font-weight: bold;
  background-color: #4caf50; /* Default color, will be overridden by classes */
}

.public-flag.true {
  background-color: #4caf50; /* Green for true */
}

.public-flag.false {
  background-color: #f44336; /* Red for false */
}
</style>
