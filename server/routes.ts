import { Router, getExpressRouter } from "./framework/router";

import { SongCollection, SongifiedNote, User, WebSession } from "./app";
import { SongCollectionDoc } from "./concepts/songcollection";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  // generate songified note concept
  @Router.post("/generate/songifiednote/")
  async generateSongifiedNote(session: WebSessionDoc, rawNote: string, lyricsTemplate: string) {
    //UNCOMMENT THIS LINE TO TEST WITH GPT
    // const generatedLyrics = await generateSongLyrics(rawNote, lyricsTemplate);

    // TEST LYRICS
    const generatedLyrics = `The lab isn't the best place to find an answer\n
    So the classroom is where I go\n
    Me and my peers at the desks, drawing shapes\n
    Sketching fast and then we analyze slow\n
    Come over and start up a discussion with just me\n
    And trust me, I'll give it a chance now\n
    Take your model, stop, put it on the table\n
    And then we start to bond, and now we're talking like\n
    Chem, you know I want your shape\n
    Your shape predicts how molecules will be\n
    Come on now, follow my lead\n
    I may be curious, don't mind me\n
    Say, girl, let's not talk too much\n
    Draw on my paper and put that theory in me\n
    Come on now, follow my lead\n
    Come, come on now, follow my lead\n
    I'm in love with the VSEPR, you see`;

    if (generatedLyrics) {
      const user = WebSession.getUser(session);
      const songifiednote = await SongifiedNote.createSongifiedNote(user, rawNote, generatedLyrics, lyricsTemplate);

      return { msg: "Song Generated", songifiednote: songifiednote };
    } else {
      return { msg: "Couldn't generate song" };
    }
  }

  @Router.delete("/delete/songifiednote")
  async deleteSongifiedNote(_id: string) {
    await SongifiedNote.deleteSongifiedNote(_id);
    return { msg: "Songified note deleted!" };
  }

  // COLLECTIONS CONCEPT

  @Router.get("/collections/:username")
  async getCollectionByOwner(username: string) {
    let collection;
    if (username) {
      const id = (await User.getUserByUsername(username))._id;
      collection = await SongCollection.getByAuthor(id);
    } else {
      return { msg: "No owner" };
    }
    return Responses.collections(collection);
  }

  @Router.get("/id/collections/:id")
  async getCollectionById(id: string) {
    const collection = await SongCollection.getCollectionById(id);
    return Responses.collection(collection);
  }

  // generate songified note concept
  @Router.post("/create/collection/")
  async createCollection(session: WebSessionDoc, title: string, description: string) {
    const user = WebSession.getUser(session);
    return await SongCollection.create(user, title, description);
  }

  @Router.patch("/collection/add/")
  async addNote(collection_id: string, songifiedNoteToAdd: string) {
    return await SongCollection.addNote(collection_id, songifiedNoteToAdd);
  }

  @Router.patch("/collections/:_id")
  async updateCollection(collection_id: string, update: Partial<SongCollectionDoc>) {
    return await SongCollection.updateNote(collection_id, update);
  }

  // @Router.delete("/collections/:_id")
  // async deleteCollection(session: WebSessionDoc, _id: ObjectId) {
  //   const user = WebSession.getUser(session);
  //   await SongCollection.isOwner(user, _id);
  //   return SongCollection.deleteCollection(_id);
  // }

  // @Router.patch("/collections/remove/one/:songifiedNote")
  // async deleteNoteFromCollection(collection_id: ObjectId, songifiedNote: ObjectId, update: Partial<SongCollectionDoc>) {
  //   // const user = WebSession.getUser(session);
  //   return await SongCollection.deleteNoteFromCollection(collection_id, songifiedNote, update);
  // }

  // @Router.patch("/collections/remove/all/:songifiedNote")
  // async deleteNoteFromAllCollection(songifiedNote: ObjectId, update: Partial<SongCollectionDoc>) {
  //   // const user = WebSession.getUser(session);
  //   return await SongCollection.deleteNoteFromAllCollections(songifiedNote, update);
  // }

  // @Router.patch("/collections/upvote/:songifiedNote")
  // async upvoteCollection(songifiedNote: ObjectId) {
  //   return await SongCollection.doUpvote(songifiedNote);
  // }
  //where it ends

  @Router.patch("/edit/rawnote/songifiednote")
  async editRawNote(_id: string, newRawNote: string) {
    await SongifiedNote.editRawNote(_id, newRawNote);
    return { msg: "Raw note updated!" };
  }

  @Router.patch("/edit/generatedlyrics/songifiednote")
  async editGeneratedLyrics(_id: string, newLyrics: string) {
    await SongifiedNote.editGeneratedLyrics(_id, newLyrics);
    return { msg: "Raw note updated!" };
  }

  @Router.get("/songifiednotes/author/:authorId")
  async getSongifiedNotesByAuthor(authorId: string) {
    const songNote = await SongifiedNote.getSongifiedNotesByAuthor(authorId);
    return { msg: "Got Songified Notes by Author!", songNote: songNote };
  }

  @Router.get("/songifiednotes/author/:songId")
  async getSongifiedNotesBySongId(songId: string) {
    const songNote = await SongifiedNote.getSongifiedNoteBySongId(songId);
    return { msg: "Got Songified Note by _id!", songNote: songNote };
  }
}

export default getExpressRouter(new Routes());
