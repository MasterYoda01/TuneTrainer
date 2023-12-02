import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface SongifiedNoteDoc extends BaseDoc {
  author: ObjectId;
  rawNote: string;
  generatedLyrics: string;
  lyricsTemplate: string;
  backgroundMusicLink: string; //link to the songs on the server
}

export default class SongifiedNoteConcept {
  public readonly songifiednotes = new DocCollection<SongifiedNoteDoc>("songifiednote");

  async createSongifiedNote(author: ObjectId, rawNote: string, generatedLyrics: string, lyricsTemplate: string, backgroundMusicLink: string) {
    const _id = await this.songifiednotes.createOne({ author: author, rawNote: rawNote, generatedLyrics: generatedLyrics, lyricsTemplate: lyricsTemplate, backgroundMusicLink: backgroundMusicLink });
    return await this.songifiednotes.readOne({ _id });
  }

  async deleteSongifiedNote(_id: string) {
    return await this.songifiednotes.deleteOne({ _id: new ObjectId(_id) });
  }

  async editGeneratedLyrics(_id: string, newLyrics: string) {
    return await this.songifiednotes.updateOne({ _id: new ObjectId(_id) }, { generatedLyrics: newLyrics });
  }

  async editRawNote(_id: string, newRawNote: string) {
    return await this.songifiednotes.updateOne({ _id: new ObjectId(_id) }, { rawNote: newRawNote });
  }

  async getSongifiedNotesByAuthor(authorId: string) {
    return await this.songifiednotes.readMany({ author: new ObjectId(authorId) });
  }

  async getSongifiedNoteBySongId(songId: ObjectId) {
    return await this.songifiednotes.readOne({ _id: songId });
  }
}
