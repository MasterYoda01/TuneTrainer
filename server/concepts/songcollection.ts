import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface SongCollectionDoc extends BaseDoc {
  title: string;
  description: string;
  songifiedNotes: ObjectId[];
  owner: ObjectId;
  upvotes: string;
}

export default class SongCollectionConcept {
  public readonly songCollections = new DocCollection<SongCollectionDoc>("songCollections");

  async create(owner: ObjectId, title: string, description: string, songifiedNotes: ObjectId[]) {
    const upvotes = "0";
    const _id = await this.songCollections.createOne({ title, owner, description, songifiedNotes, upvotes });
    return { msg: "Song Collection successfully created!", songCollection: await this.songCollections.readOne({ _id }) };
  }

  async getCollection(query: Filter<SongCollectionDoc>) {
    const songCollections = await this.songCollections.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return songCollections;
  }

  async getByAuthor(owner: ObjectId) {
    return await this.getCollection({ owner });
  }

  async update(_id: ObjectId, update: Partial<SongCollectionDoc>) {
    this.sanitizeUpdate(update);
    await this.songCollections.updateOne({ _id }, update);
    return { msg: "Post successfully updated!" };
  }

  async addNote(collection_id: ObjectId, songifiedNote: ObjectId, update: Partial<SongCollectionDoc>) {
    const collection = await this.songCollections.readOne({ collection_id });
    const addedSong = collection?.songifiedNotes.concat([songifiedNote]);
    update.songifiedNotes = addedSong;
    await this.songCollections.updateOne(collection_id, update);
  }

  async deleteCollection(_id: ObjectId) {
    await this.songCollections.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async deleteNoteFromCollection(collection_id: ObjectId, songifiedNote: ObjectId, update: Partial<SongCollectionDoc>) {
    const songNotes = await this.songCollections.readOne({ collection_id });
    const songs = songNotes?.songifiedNotes;
    const index = songs?.indexOf(songifiedNote);
    if (index !== undefined) {
      songs?.splice(index, 1);
      update.songifiedNotes = songs;
      await this.songCollections.updateOne({ collection_id }, update);
    }
    return { msg: "collection successfully updated!" };
  }

  async deleteNoteFromAllCollections(songifiedNote: ObjectId, update: Partial<SongCollectionDoc>) {
    const songcollection = await this.songCollections.readMany({});
    for (const songdoc of songcollection) {
      const currSongs = songdoc.songifiedNotes;
      const index = currSongs.indexOf(songifiedNote);
      if (index !== -1) {
        currSongs.splice(index, 1);
        update.songifiedNotes = currSongs;
        await this.songCollections.updateOne(currSongs, update);
      }
    }
    return { msg: "collections successfully updated!" };
  }

  async updateUpvote(songCollection: ObjectId) {
    const collection = await this.songCollections.readOne({ songCollection });
    if (collection !== null) {
      const upvote = collection.upvotes.toString();
      const num = parseInt(upvote);
      const plusone = num + 1;
      const updatedUpvotes = plusone.toString();
      return updatedUpvotes;
    }
  }

  async doUpvote(songCollection: ObjectId) {
    return await this.songCollections.updateOne({ songCollection }, { upvotes: await this.updateUpvote(songCollection) });
  }

  async isOwner(user: ObjectId, _id: ObjectId) {
    const songCollection = await this.songCollections.readOne({ _id });
    if (!songCollection) {
      throw new NotFoundError(`Collection ${_id} does not exist!`);
    }
    if (songCollection.owner.toString() !== user.toString()) {
      throw new CollectionAuthorNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<SongCollectionDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["content", "options"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class CollectionAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
