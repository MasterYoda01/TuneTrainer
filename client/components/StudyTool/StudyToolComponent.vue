<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, reactive, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const userStore = useUserStore();
const { currentUsername } = storeToRefs(userStore);
const collections = ref<Array<Record<string, string>>>([]);
const selectedCollection = ref("");
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

  const collectionId = selectedCollection.value;
  await fetchy(`/api/studytool`, "POST", {
    body: {
      collectionId,
      results,
    },
  });
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
    const response = await fetchy(`/api/songifiednote/bysongid/${songNoteId}`, "GET", {});
    return response;
  } catch (error) {
    console.error("Error getting song note:", error);
    return null;
  }
}

async function getStudyCollection() {
  try {
    const response = await fetchy(`/api/studytool/${selectedCollection.value}`, "GET", {});
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
  }
}

onBeforeMount(async () => {
  await getUserCollections();
  if (studyCollection.cards.length > 0) {
    replaceRandomWords(studyCollection.cards[currentCardIndex.value].lyrics);
  }
});
</script>

<template>
  <div class="study-tool-container">
    <h1 class="title">Study Tool</h1>
    <p class="description">Study your song notes!</p>
    <div>
      <select v-model="selectedCollection" class="collection-selector">
        <option disabled value="">Select a Collection</option>
        <option v-for="collection in collections" :key="collection._id" :value="collection._id">
          {{ collection.title }}
        </option>
      </select>
      <button class="study-button" @click="getStudyCollection">Study</button>
    </div>
    <div>
      <button v-if="studyCollection.cards.length > 0" @click="finishStudying">Finish Studying</button>
      <div class="study-cards" v-if="studyCollection.cards.length > 0">
        <h3>Card {{ currentCardIndex + 1 }} out of {{ studyCollection.cards.length }}</h3>
        <template v-for="(word, index) in currLyrics" :key="index">
          <span v-if="!wordsToGuess.some((item) => item.index === index)">{{ word }}</span>
          <input v-else type="text" v-model="userInputs[index]" />
          <br v-if="word.includes('\n')" />
        </template>
        <div v-if="guessResult.isCorrect === false" class="incorrect-msg">Incorrect</div>
        <div class="navigation-buttons">
          <button @click="checkAnswers">Submit</button>
          <button @click="prevCard" :disabled="currentCardIndex === 0">Previous</button>
          <button @click="nextCard" :disabled="currentCardIndex >= studyCollection.cards.length - 1">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.study-tool-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px; /* Adjust the vertical gap between elements */
  margin-top: 20px;
}

.title {
  color: #5cb48c;
  font-size: 4em;
  margin-left: 20px;
  margin-bottom: 0; /* Remove bottom margin for the title */
}

.incorrect-msg {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}
.navigation-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.study-cards {
  width: 700px;
  padding: 15px;
  border: 2px solid #4caf50;
  border-radius: 10px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.collection-selector {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

input[type="text"] {
  padding: 5px;
  width: 80px;
  margin: 0 5px;
  border-radius: 3px;
  border: 1px solid #ccc;
}

.study-cards input {
  background-color: #fff;
  border: 1px solid #4caf50;
}
</style>
