import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface SongifiedNoteDoc extends BaseDoc {
  author: ObjectId;
  rawNote: string;
  generatedLyrics: string;
  lyricsTemplate: string;
  backgroundMusic: string; //link to the songs on the server
  // quizCard: string; //actually let's omit this
}

export default class SongifiedNoteConcept {
  public readonly songifiednotes = new DocCollection<SongifiedNoteDoc>("songifiednote");

  async createSongifiedNote(author: ObjectId, rawNote: string, generatedLyrics: string, lyricsTemplate: string) {
    const _id = await this.songifiednotes.createOne({ author: author, rawNote: rawNote, generatedLyrics: generatedLyrics, lyricsTemplate: lyricsTemplate });
    return await this.songifiednotes.readOne({ _id });
  }

  async deleteSongifiedNote(_id: string) {
    return this.songifiednotes.deleteOne({ _id: new ObjectId(_id) });
  }

  async editGeneratedLyrics(_id: string, newLyrics: string) {
    return this.songifiednotes.updateOne({ _id: new ObjectId(_id) }, { generatedLyrics: newLyrics });
  }

  async editRawNote(_id: string, newRawNote: string) {
    return this.songifiednotes.updateOne({ _id: new ObjectId(_id) }, { rawNote: newRawNote });
  }

  async getSongifiedNotesByAuthor(authorId: string) {
    return this.songifiednotes.readMany({ author: new ObjectId(authorId) });
  }

  async getSongifiedNoteBySongId(songId: string) {
    return this.songifiednotes.readOne({ _id: new ObjectId(songId) });
  }
}
