import { ref as firebaseRef, getDownloadURL, getStorage, uploadBytesResumable } from "firebase/storage";
import "../firebase.ts";

const storage = getStorage();

export async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    const storageRef = firebaseRef(storage, "images/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          reject(error);
        },
        async () => {
          resolve(await getDownloadURL(storageRef));
        },
      );
    });

    return await getDownloadURL(storageRef);
  }
}
