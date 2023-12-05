import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface StudyToolDoc extends BaseDoc {
  originalCollectionId: ObjectId;
  songNotesCoefficients: {
    [songNoteId: string]: number;
  };
}

interface Coefficients {
  [key: string]: number;
}

export default class PostConcept {
  public readonly studytool = new DocCollection<StudyToolDoc>("studytool");

  async getStudyToolCollection(collectionId: ObjectId, songNoteIds: ObjectId[]) {
    // Read and see if this collection already exists
    let studyToolCollection = await this.studytool.readOne({ originalCollectionId: collectionId });

    console.log("songsIds", studyToolCollection, songNoteIds);

    if (studyToolCollection) {
      // Update the existing entry
      const currentCoefficients = JSON.parse(JSON.stringify(studyToolCollection.songNotesCoefficients));

      console.log("Original coefficients:", currentCoefficients);

      const songNoteIdStrings = new Set(songNoteIds.map((id) => id.toString()));

      for (const songId of Object.keys(currentCoefficients)) {
        if (!songNoteIdStrings.has(songId)) {
          delete currentCoefficients[songId];
        }
      }
      for (const songNoteIdStr of songNoteIdStrings) {
        if (!Object.prototype.hasOwnProperty.call(currentCoefficients, songNoteIdStr)) {
          console.log("updating to 1");
          currentCoefficients[songNoteIdStr] = 1;
        }
      }

      await this.studytool.updateOne({ _id: studyToolCollection._id }, { songNotesCoefficients: currentCoefficients });
      studyToolCollection = await this.studytool.readOne({ _id: studyToolCollection._id });

      console.log("Updated studyToolCollection:", studyToolCollection);
    } else {
      // Create a new entry
      const initialCoefficients = songNoteIds.reduce<Coefficients>((acc, songNoteId) => {
        const index = songNoteId.toString();
        acc[index] = 1;
        return acc;
      }, {});

      const _id = await this.studytool.createOne({
        originalCollectionId: collectionId,
        songNotesCoefficients: initialCoefficients,
      });

      studyToolCollection = await this.studytool.readOne({ _id });
    }

    return studyToolCollection;
  }

  async updateStudyToolCollectionScores(collectionId: ObjectId, newCoeffs: Array<{ songNoteId: string; coeff: number }>) {
    const coeffsObject = newCoeffs.reduce<Coefficients>((obj, item) => {
      obj[item.songNoteId] = item.coeff;
      return obj;
    }, {} as Coefficients);
    return await this.studytool.updateOne({ originalCollectionId: collectionId }, { songNotesCoefficients: coeffsObject });
  }
}
