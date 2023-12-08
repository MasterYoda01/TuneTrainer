import { ObjectId } from "mongodb";
import { CollectionAccessControl, SongCollection, SongifiedNote, SongifiedNoteAccessControl, StudyTool, User, WebSession } from "./app";
import { SongCollectionDoc } from "./concepts/songcollection";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { Router, getExpressRouter } from "./framework/router";
import { generateSongLyrics } from "./gptHelpers";
import { idsAreEqual, parseInputAsObjectId } from "./parser";
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
  async generateSongifiedNote(session: WebSessionDoc, rawNote: string, lyricsTemplate: string, backgroundMusicLink: string) {
    //UNCOMMENT THIS LINE TO TEST WITH GPT

    const generatedLyrics = await generateSongLyrics(rawNote, lyricsTemplate);

    // // TEST LYRICS
    // const generatedLyrics = `
    // And trust me, it's more than just acid rain.\n
    // Pour the solution, watch, as colors change,\n
    // In the world of atoms, isn't it strange?\n
    // Chem, you know I love your bonds,\n
    // From ionic to covalent, it all responds.\n
    // Let's not wait, stir up the chemical sea,\n
    // I'm fascinated, with reactions, let's agree.\n
    // Hey, let's decode molecular speech,\n
    // Write down the formula, let's each teach.\n
    // Come now, stir up the elemental creed,\n
    // Come, come now, in the periodic table we read,\n
    // I'm in love with chemistry, indeed.\n`;

    if (generatedLyrics) {
      const user = WebSession.getUser(session);
      const songifiednote = await SongifiedNote.createSongifiedNote(user, rawNote, generatedLyrics, lyricsTemplate, backgroundMusicLink);
      if (songifiednote !== null) await SongifiedNoteAccessControl.putAccess(user, songifiednote._id);
      return { msg: "Song Generated", songifiednote: songifiednote };
    } else {
      return { msg: "Couldn't generate song" };
    }
  }

  @Router.delete("/delete/songifiednote")
  async deleteSongifiedNote(session: WebSessionDoc, _id: string, collectionid: string) {
    const user = WebSession.getUser(session);
    const parsedNoteId = parseInputAsObjectId(_id);
    console.log("COL ID", collectionid);
    await SongifiedNote.isAuthor(user, parsedNoteId);

    await SongifiedNote.deleteSongifiedNote(_id);
    await SongifiedNoteAccessControl.removeAccess(user, parsedNoteId, new ObjectId());
    //delete the note from all collections that it is a part of

    await SongCollection.deleteNoteFromCollection(collectionid, _id);

    return { msg: "Songified note deleted!" };
  }

  // COLLECTIONS CONCEPT

  @Router.get("/users/:username/collections")
  async getCollectionByOwner(username: string) {
    let collection;
    if (username) {
      const id = (await User.getUserByUsername(username))._id;
      collection = await SongCollection.getByAuthor(id);
    } else {
      return { msg: "No owner" };
    }
    return Responses.collections(collection); // TODO: access control
  }

  // generate songified note concept
  @Router.post("/create/collection/")
  async createCollection(session: WebSessionDoc, title: string, description: string) {
    console.log("in collection");
    const user = WebSession.getUser(session);
    const created = await SongCollection.create(user, title, description);
    if (created.songCollection !== null) {
      await CollectionAccessControl.putAccess(user, created.songCollection._id); // author always has access
    }

    return { msg: created.msg, collection: await Responses.collection(created.songCollection) };
  }

  @Router.patch("/collection/add/")
  async addNote(session: WebSessionDoc, collection_id: string, songifiedNoteToAdd: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(collection_id);
    const parsedSongId: ObjectId = parseInputAsObjectId(songifiedNoteToAdd);
    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    await SongifiedNoteAccessControl.assertHasAccess(user, parsedSongId);
    return await SongCollection.addNote(collection_id, songifiedNoteToAdd);
  }

  //return objects of all songified notes in the collection
  @Router.get("/songifiednotes/collection/:collection_id")
  async getSongNotesInCollection(session: WebSessionDoc, collection_id: string) {
    const songNoteIds = (await SongCollection.getCollectionById(new ObjectId(collection_id)))?.songifiedNotes;
    const songNotesArray = [];
    if (songNoteIds) {
      for (const songNoteId of songNoteIds) {
        const songNote = await SongifiedNote.getSongifiedNoteBySongId(songNoteId);
        if (songNote) songNotesArray.push(songNote);
      }
    }
    return songNotesArray;
  }

  @Router.delete("/collections/:_id")
  async deleteCollection(session: WebSessionDoc, _id: string) {
    const user = WebSession.getUser(session);
    const new_id = new ObjectId(_id);
    await SongCollection.isOwner({ user, _id: new_id });
    return SongCollection.deleteCollection(_id);
  }

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
  async editRawNote(session: WebSessionDoc, _id: string, newRawNote: string) {
    const user = WebSession.getUser(session);
    const parsedSongId: ObjectId = parseInputAsObjectId(_id);
    await SongifiedNoteAccessControl.assertHasAccess(user, parsedSongId);
    await SongifiedNote.editRawNote(_id, newRawNote);
    return { msg: "Raw note updated!" };
  }

  @Router.patch("/edit/generatedlyrics/songifiednote")
  async editGeneratedLyrics(session: WebSessionDoc, _id: string, newLyrics: string) {
    const user = WebSession.getUser(session);
    const parsedSongId: ObjectId = parseInputAsObjectId(_id);
    await SongifiedNoteAccessControl.assertHasAccess(user, parsedSongId);
    await SongifiedNote.editGeneratedLyrics(_id, newLyrics);
    return { msg: "Raw note updated!" };
  }

  // TODO: if this gets used, implement access control
  /** 
  @Router.get("/songifiednotes/author/:authorId") 
  async getSongifiedNotesByAuthor(session: WebSessionDoc, authorId: string) {
    const user = WebSession.getUser(session);
    const songNote = await SongifiedNote.getSongifiedNotesByAuthor(authorId);
    const accessibleSongNotes = songNote.filter((noteDoc) => SongifiedNoteAccessControl.assertHasAccess(user, noteDoc._id));
    return { msg: "Got Songified Notes by Author!", songNote: accessibleSongNotes };
  }
  */

  @Router.get("/songifiednotes/id/:songId")
  async getSongifiedNotesBySongId(session: WebSessionDoc, songId: string) {
    const parsedSongId: ObjectId = parseInputAsObjectId(songId);

    const songNote = await SongifiedNote.getSongifiedNoteBySongId(parsedSongId);
    console.log(await Responses.songnote(songNote));
    return { msg: "Got Songified Note by _id!", songNote: await Responses.songnote(songNote) };
  }

  // STUDY TOOL CONCEPT

  @Router.get("/studytool/:collectionId")
  async getStudyToolCollection(session: WebSessionDoc, collectionId: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(collectionId);
    await CollectionAccessControl.assertHasAccess(user, parsedCollectionId);
    //get all the song notes in this collection
    const collection = await SongCollection.getCollectionById(new ObjectId(collectionId));
    if (collection) {
      const studyToolColl = await StudyTool.getStudyToolCollection(new ObjectId(collectionId), collection.songifiedNotes);
      return studyToolColl;
    } else {
      throw new Error("No study tool for this collection");
    }
  }

  @Router.post("/studytool/")
  async updateStudyToolCollectionScores(session: WebSessionDoc, collectionId: string, results: Array<{ songNoteId: string; coeff: number }>) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(collectionId);
    await CollectionAccessControl.assertHasAccess(user, parsedCollectionId);
    console.log("Type of newCoeffs:", typeof results, Array.isArray(results));

    return await StudyTool.updateStudyToolCollectionScores(new ObjectId(collectionId), results);
  }

  @Router.put("/collectionaccesscontrols/users/:userId/accessibleContent")
  async grantUserAccessToCollection(session: WebSessionDoc, contentId: string, userId: string) {
    console.log("grant accessed");
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(contentId);

    //assert content existence
    await SongCollection.getCollectionById(parsedCollectionId);

    const parsedUserId: ObjectId = parseInputAsObjectId(userId);
    await User.userExists(parsedUserId);

    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    return await CollectionAccessControl.putAccess(parsedUserId, parsedCollectionId);
  }

  @Router.put("/collectionaccesscontrols/publiccollections/:contentId")
  async makeCollectionPublic(session: WebSessionDoc, contentId: string) {
    console.log("makePublic accessed");
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(contentId);

    //assert content existence
    await SongCollection.getCollectionById(parsedCollectionId);

    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    return await CollectionAccessControl.setPublic(parsedCollectionId);
  }

  /**
   * Makes the collection non-public
   *
   * @param session of user who owns the collection
   * @param contentId
   */
  @Router.delete("/collectionaccesscontrols/publiccollections/:contentId")
  async makeCollectionNonPublic(session: WebSessionDoc, contentId: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(contentId);

    //assert content existence
    await SongCollection.getCollectionById(parsedCollectionId);

    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    return await CollectionAccessControl.setRestricted(parsedCollectionId);
  }

  /**
   * Makes it so that the user with id `userId` no longer has access to the the collection corresponding
   * to the access controller with id `_id`; can only be performed by the author of the collection
   *
   * @param session
   * @param _id the id of the collection
   * @param userId the id of the user whose access will be removed from the collection
   */
  @Router.delete("/collectionaccesscontrols/users/:userId/accessibleContent/:_id")
  async removeUserAccessToCollection(session: WebSessionDoc, _id: string, userId: string) {
    const user = WebSession.getUser(session);

    const parsedCollectionId: ObjectId = parseInputAsObjectId(_id);
    await SongCollection.getCollectionById(parsedCollectionId);

    const parsedUserId: ObjectId = parseInputAsObjectId(userId);
    await User.userExists(parsedUserId);

    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    return await CollectionAccessControl.removeAccess(parsedUserId, parsedCollectionId, user); // TODO: store author as state Or read from songcollectionconcept
  }

  // @Router.get("/accessible_collections")
  // async getAccessibleCollectionsWithRestrictedAccess(session: WebSessionDoc) {
  //   const user = WebSession.getUser(session);
  //   const retrievalProcesses: Promise<SongCollectionDoc>[] = (await CollectionAccessControl.getContentSharedWithUser(user)).map((id) => {
  //     return SongCollection.getCollectionById(id);
  //   });
  //   const accessibleCollections: SongCollectionDoc[] = await Promise.all(retrievalProcesses);

  //   return Responses.collections(accessibleCollections);
  // }

  @Router.get("/publiccollections")
  async getPublicCollections() {
    const publicColl = await CollectionAccessControl.getPublicContent();
    const collectionObjsArr: SongCollectionDoc[] = [];
    console.log("publicColl", publicColl);
    for (const id of publicColl) {
      const collectionObj = await SongCollection.getCollectionById(id);
      if (collectionObj) {
        collectionObjsArr.push(collectionObj);
      }
    }
    return Responses.collections(collectionObjsArr);
  }

  @Router.get("/otherusers/accessiblecollections")
  async getAccessibleCollectionsFromOtherUsers(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const retrievalProcesses: Promise<SongCollectionDoc | null>[] = (await CollectionAccessControl.getContentSharedWithUser(user)).map((id) => {
      return SongCollection.getCollectionById(id);
    });

    const accessibleCollections: SongCollectionDoc[] = (await Promise.all(retrievalProcesses)).filter((collection): collection is SongCollectionDoc => collection !== null);
    const collectionsByOthers = accessibleCollections.filter((collection) => !idsAreEqual(collection.owner, user));

    return Responses.collections(collectionsByOthers);
  }

  @Router.get("/collections/:id")
  async getCollectionById(
    session: WebSessionDoc,
    id: string,
  ): Promise<{
    owner: string;
    title: string;
    description: string;
    songifiedNotes: ObjectId[];
    upvotes: number;
    _id: ObjectId;
    dateCreated: Date;
    dateUpdated: Date;
  } | null> {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(id);

    await CollectionAccessControl.assertHasAccess(user, parsedCollectionId);

    return Responses.collection(await SongCollection.getCollectionById(parsedCollectionId));
  }

  @Router.get("/collections/:collectionId/users_with_restricted_access")
  async getUsersWithRestrictedAccess(session: WebSessionDoc, collectionId: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(collectionId);

    await CollectionAccessControl.assertHasAccess(user, parsedCollectionId);
    const userIds: ObjectId[] = await CollectionAccessControl.getUsersWithRestrictedAccess(parsedCollectionId);
    const userInfoProcesses = userIds.map((userId) => User.getUserById(userId));
    return await Promise.all(userInfoProcesses);
  }

  /**
   *
   * @param session of a user with access to the collection
   * @param collectionId an ObjectId
   * @returns usersWithExplicitAccess: the list of users who will have access to the collection if it is not public,
   *          isPublic: is true if collection is public
   */
  @Router.get("/whohascollectionaccess/:collectionId")
  async getAccessControl(
    session: WebSessionDoc,
    collectionId: string,
  ): Promise<{
    isPublic: boolean;
    usersWithExplicitAccess: {
      username: string;
      _id: ObjectId;
      dateCreated: Date;
      dateUpdated: Date;
    }[];
  }> {
    console.log("inside", collectionId);
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(collectionId);

    await CollectionAccessControl.assertHasAccess(user, parsedCollectionId);

    const collectionIsPublic: boolean = await CollectionAccessControl.isPublic(parsedCollectionId);
    const userIds: ObjectId[] = await CollectionAccessControl.getUsersWithRestrictedAccess(parsedCollectionId);
    const userInfoProcesses = userIds.map((userId) => User.getUserById(userId));
    const usersWithExplicitAccess = await Promise.all(userInfoProcesses);
    return { isPublic: collectionIsPublic, usersWithExplicitAccess: usersWithExplicitAccess };
  }
}

// async function getAccessibleCollectionsWithRestrictedAccess(session: WebSessionDoc) {
//   const user = WebSession.getUser(session);
//   const retrievalProcesses: Promise<SongCollectionDoc>[] = (await CollectionAccessControl.getContentSharedWithUser(user)).map((id) => {
//     return SongCollection.getCollectionById(id);
//   });
//   const accessibleCollections: SongCollectionDoc[] = await Promise.all(retrievalProcesses);

//   return Responses.collections(accessibleCollections);
// }
//   return Responses.collections(accessibleCollections);
// }

export default getExpressRouter(new Routes());
