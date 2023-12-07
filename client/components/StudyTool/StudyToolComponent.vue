<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, reactive, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);
const collections = ref<Array<Record<string, string>>>([]);
const selectedCollectionTitle = ref(""); 
const selectedCollectionID = ref("");
const chosen = ref(false);
const currentCardIndex = ref(0);

interface Card {
  songNoteId: string;
  coeff: number;
  lyrics: string;
}

const studyCollection = reactive({
  cards: [] as Card[],
});

interface wordToGuess {
  word: string;
  index: number;
}

const userInputs = ref([] as string[]);
const currLyrics = ref([] as string[]);
const wordsToGuess = ref([] as wordToGuess[]);

interface GuessResult {
  isCorrect: boolean | null;
  showNext: boolean;
}

const guessResult = ref<GuessResult>({
  isCorrect: null,
  showNext: false,
});

async function finishStudying() {
  const results = studyCollection.cards.map((card) => ({
    songNoteId: card.songNoteId,
    coeff: card.coeff,
  }));

  const collectionId = selectedCollectionID.value;
  await fetchy(`/api/studytool`, "POST", {
    body: {
      collectionId,
      results,
    },
  });
  chosen.value = false;
}

function replaceRandomWords(lyrics: string) {
  currLyrics.value = lyrics.split(/(\s+|\n)/);

  // Reset wordsToGuess and userInputs
  wordsToGuess.value = [];
  userInputs.value = [];

  // Filter out valid words for guessing along with their indices
  const validWordsIndices = currLyrics.value.map((word, index) => ({ word, index })).filter(({ word }) => word.length >= 4 && /^[a-zA-Z]+$/.test(word));

  while (wordsToGuess.value.length < 3) {
    const randomSelection = validWordsIndices[Math.floor(Math.random() * validWordsIndices.length)];
    if (!wordsToGuess.value.some((item) => item.index === randomSelection.index)) {
      wordsToGuess.value.push(randomSelection);
      userInputs.value[randomSelection.index] = "";
    }
  }

  console.log(
    "Indices to guess:",
    wordsToGuess.value.map((item) => item.index),
  );
}

function checkAnswers() {
  // Check if each guess is correct
  const correct = wordsToGuess.value.every((item) => {
    const userGuess = userInputs.value[item.index];
    return userGuess && item.word.toLowerCase() === userGuess.toLowerCase();
  });

  const currentCard = studyCollection.cards[currentCardIndex.value];
  if (correct) {
    currentCard.coeff += 0.1;
    guessResult.value = { isCorrect: true, showNext: true };
  } else {
    currentCard.coeff -= 0.2;
    guessResult.value = { isCorrect: false, showNext: false };
  }

  if (guessResult.value.showNext) {
    nextCard();
  }
}

function nextCard() {
  if (currentCardIndex.value < studyCollection.cards.length - 1) {
    currentCardIndex.value++;
    resetGuessAndLoadNewCard();
  }
}

function prevCard() {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
    resetGuessAndLoadNewCard();
  }
}

function resetGuessAndLoadNewCard() {
  guessResult.value = { isCorrect: null, showNext: false };
  replaceRandomWords(studyCollection.cards[currentCardIndex.value].lyrics);
}

async function getUserCollections() {
  try {
    const response = await fetchy(`/api/users/${currentUsername.value}/collections`, "GET", {});
    collections.value = response;
    const sharedResponse = await fetchy(`/api/other_users/accessible_collections`, "GET");
    collections.value = collections.value.concat(sharedResponse);
  } catch (error) {
    console.error("Error getting collection notes:", error);
  }
}

async function getSongNoteById(songNoteId: string) {
  try {
    const response = await fetchy(`/api/songifiednotes/id/${songNoteId}`, "GET", {});
    return response.songNote;
  } catch (error) {
    console.error("Error getting song note:", error);
    return null;
  }
}

async function getStudyCollection() {
  try {
    const response = await fetchy(`/api/studytool/${selectedCollectionID.value}`, "GET", {});
    const songNotesCoefficients = response.songNotesCoefficients;

    const cardDataPromises = Object.entries(songNotesCoefficients).map(async ([id, coeff]) => {
      const songNote = await getSongNoteById(id);
      return {
        songNoteId: id,
        coeff: typeof coeff === "number" ? coeff : 1,
        lyrics: songNote?.generatedLyrics || "",
      };
    });
    studyCollection.cards = (await Promise.all(cardDataPromises)).sort((a, b) => (a.coeff as number) - (b.coeff as number));

    currentCardIndex.value = 0;

    if (studyCollection.cards.length > 0) {
      replaceRandomWords(studyCollection.cards[currentCardIndex.value].lyrics);
    }
  } catch (error) {
    console.error(error);
  } finally{
    chosen.value = true;
  }
}

onBeforeMount(async () => {
  await getUserCollections();
  if (studyCollection.cards.length > 0) {
    replaceRandomWords(studyCollection.cards[currentCardIndex.value].lyrics);
  }
});

function changeSelection(collection: Record<string, string>){
  selectedCollectionID.value = collection._id;
  selectedCollectionTitle.value = collection.title; 
}
</script>

<template>
  <main class="study-tool-container">
    <h3 v-if="!chosen">Choose a song collection to study!</h3><p/>
    <div class="selection" v-if="!chosen">
      <button class="dropdown">
        {{ selectedCollectionTitle ? selectedCollectionTitle : "Choose Collection" }}
        <div class="collection-dropdown">
          <div v-for="collection in collections" :key="collection._id">
            <button class="collection-name" @click="changeSelection(collection)">
              {{ collection.title }}
            </button>
          </div>
        </div>
      </button>

      <button type="submit" @click="getStudyCollection()">Study Collection</button>
    </div>
    <section v-if="chosen">
      <button v-if="studyCollection.cards.length > 0" @click="finishStudying" class="finish">Finish Studying</button>
      <div v-if="guessResult.isCorrect === false" class="incorrect-msg">Try Again!</div>
      
      <div class="study-cards" v-if="studyCollection.cards.length > 0">
        <h3>Card {{ currentCardIndex + 1 }} of {{ studyCollection.cards.length }}</h3>
        <template v-for="(word, index) in currLyrics" :key="index">
          <span v-if="!wordsToGuess.some((item) => item.index === index)">{{ word }}</span>
          <input v-else type="text" v-model="userInputs[index]" />
          <br v-if="word.includes('\n')" />
        </template>
      </div>
      <div class="navigation-buttons">
          <button @click="checkAnswers" style="color:#5cb48c">Submit</button>
          <button @click="prevCard" class="switch" :disabled="currentCardIndex === 0">Previous</button>
          <button @click="nextCard" class="switch" :disabled="currentCardIndex >= studyCollection.cards.length - 1">Next</button>
      </div>
    </section>
  </main>
</template>
<style scoped>
button:disabled {
  display: none;
}
.finish{
  color: black;
  padding: 14px 20px;
  margin: -3% 0 2em;
  border-radius: 9px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 15px;
  border: solid 2px #5cb48c;
  background-color: #f9f9f9;
}
.finish:hover{
  color: #fff;
  background-color: #5cb48c;
}
h3{
  font-size: 16px;
  font-family: Arial, Helvetica, sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0.5em 0;
}

.selection {
  display: flex;
  gap: 10px;
  width: 50%;
}
.dropdown {
  width: 100%;
  background-color: #fff;
  color: #5cb48c;
  border: solid 2px #5cb48c;
  padding: 14px 20px;
  margin: 8px 0;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 15px;
  position: relative;
  
}
.dropdown:hover .collection-dropdown {
  display: block;
}
.collection-dropdown {
  display: none;
  margin: 0 0 -20% -7%;
  background-color: #fff;
  border-radius: 5px;
  width: 100%;
  padding-bottom: 2%;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  position: absolute;
}
.collection-name {
  color: #999;
  border: 0;
  width: 100%;
  text-align: left;
  font-size: 20px;
  background: 0;
  padding: 3% 5%;
  border-bottom: solid 1px #999;
}
.collection-name:hover {
  color: #5cb48c;
  border-color: #5cb48c;
  font-weight: 6000;
}

.description {
  font-weight: bold;
}

.incorrect-msg {
  color: red;
  font-weight: bold;
  margin-top: 10px;
  float: right;
  animation: 5s infinite alternate slidein;
}
.navigation-buttons {
  margin-top: 0;
  display: flex;
  float: right;
  gap: 1em;
}
.navigation-buttons button{
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 15px;
  padding: 4px 6px;
  border-radius: 9px;
}
.navigation-buttons button:hover{
  background-color: #999;
  color: #fff;
}
.navigation-buttons .switch:hover{
  border: solid 2px #5cb48c;
  background-color: #f1f3f5;
  padding: 2px 4px;
  color: #5cb48c;
}
.study-cards {
  column-count: 2;
  column-gap: 20px;
  padding: 15px 25px;
  border: 2px solid #999;
  border-radius: 10px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}
.study-cards input {
  background-color: #fff;
  padding: 1px 3px;
  width: 80px;
  margin: 0 3px;
  border-radius: 3px;
  border: 1px solid #5cb48c;
}
button[type="submit"]{
  text-align: left;
}
button[type="submit"]:hover{
  background-color: #5cb48c;
  color: #fff;
}
</style>
