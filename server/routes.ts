import { ObjectId } from "mongodb";
import { CollectionAccessControl, SongCollection, SongifiedNote, User, WebSession } from "./app";
import { SongCollectionDoc } from "./concepts/songcollection";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import { Router, getExpressRouter } from "./framework/router";
import { parseInputAsObjectId } from "./parser";
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

  @Router.get("/users/:username/collections")
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

  // generate songified note concept
  @Router.post("/create/collection/")
  async createCollection(session: WebSessionDoc, title: string, description: string) {
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
    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    return await SongCollection.addNote(collection_id, songifiedNoteToAdd);
  }

  @Router.patch("/collections/:_id")
  async updateCollection(session: WebSessionDoc, collection_id: string, update: Partial<SongCollectionDoc>) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(collection_id);
    await SongCollection.isOwner({ user, _id: parsedCollectionId });
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

  /**
   *  Grants a user access to the collection; can only be performed by author of collection
   *
   * @param session
   * @param contentId the id of the collection
   * @param userId the id of the user who will be granted access to the collection
   */
  @Router.put("/collection_access_controls/users/:userId/accessibleContent")
  async grantUserAccessToCollection(session: WebSessionDoc, contentId: string, userId: string) {
    const user = WebSession.getUser(session);
    const parsedCollectionId: ObjectId = parseInputAsObjectId(contentId);

    //assert content existence
    await SongCollection.getCollectionById(parsedCollectionId);

    const parsedUserId: ObjectId = parseInputAsObjectId(userId);
    await User.userExists(parsedUserId);

    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    return await CollectionAccessControl.putAccess(parsedUserId, parsedCollectionId);
  }

  /**
   * Makes the collection accessable to every user
   *
   * @param session of user who owns the collection
   * @param contentId
   */
  @Router.put("/collection_access_controls/publicCollections/:contentId")
  async makeCollectionPublic(session: WebSessionDoc, contentId: string) {
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
  @Router.delete("/collection_access_controls/publicCollections/:contentId")
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
  @Router.delete("/collection_access_controls/users/:userId/accessibleContent/:_id")
  async removeUserAccessToCollection(session: WebSessionDoc, _id: string, userId: string) {
    const user = WebSession.getUser(session);

    const parsedCollectionId: ObjectId = parseInputAsObjectId(_id);
    await SongCollection.getCollectionById(parsedCollectionId);

    const parsedUserId: ObjectId = parseInputAsObjectId(userId);
    await User.userExists(parsedUserId);

    await SongCollection.isOwner({ user, _id: parsedCollectionId });
    return await CollectionAccessControl.removeAccess(parsedUserId, parsedCollectionId, user); // TODO: store author as state Or read from songcollectionconcept
  }

  /**
   *
   *
   * @param session of a user
   * @returns the collections that the user has access to (that aren't public)
   */
  @Router.get("/accessible_collections")
  async getAccessibleCollectionsWithRestrictedAccess(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const retrievalProcesses: Promise<SongCollectionDoc>[] = (await CollectionAccessControl.getContentSharedWithUser(user)).map((id) => {
      return SongCollection.getCollectionById(id);
    });
    const accessibleCollections: SongCollectionDoc[] = await Promise.all(retrievalProcesses);

    return Responses.collections(accessibleCollections);
  }

  /**
   *
   *
   * @param session of a user
   * @returns the collections that the user has access to (that aren't public)
   */
  @Router.get("/other_users/accessible_collections")
  async getAccessibleCollectionsFromOtherUsers(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const retrievalProcesses: Promise<SongCollectionDoc>[] = (await CollectionAccessControl.getContentSharedWithUser(user)).map((id) => {
      return SongCollection.getCollectionById(id);
    });
    const accessibleCollections: SongCollectionDoc[] = await Promise.all(retrievalProcesses);
    const collectionsByOthers = accessibleCollections.filter((collection) => !idsAreEqual(collection.owner, user));

    return Responses.collections(collectionsByOthers);
  }

  /**
   *
   *
   * @param session of a user
   * @param id the id of a collection
   * @returns the contents of the collection, only if `user` has access to it
   */
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

  /**
   *
   * @param session of a user with access to the collection
   * @param collectionId an ObjectId
   * @returns the list of users who will have access to the collection if it is not public
   */
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
  @Router.get("/collection_access_controls/:collectionId")
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

export default getExpressRouter(new Routes());
