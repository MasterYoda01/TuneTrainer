import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

// export interface PostOptions {
//   backgroundColor?: string;
// }

export interface SongCollectionDoc extends BaseDoc {
  title: string;
  description: string;
  songifiedNotes: ObjectId[];
  owner: ObjectId;
  upvotes: string;
  //   options?: PostOptions;
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

  async deleteCollection(_id: ObjectId) {
    await this.songCollections.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }
  async deleteNote(query: Filter<SongCollectionDoc>, update: Partial<SongCollectionDoc>) {
    //Remove a single SongifiedNote from the SongCollection.
    await this.songCollections.updateOne(query, update);
    return { msg: "Song successfully deleted from collection!" };
    // return songCollections;
  }

  async deleteNotes(query: Filter<SongCollectionDoc>, update: Partial<SongCollectionDoc>) {
    //Remove a single SongifiedNote from the SongCollection.
    await this.songCollections.updateMany(query, update);
    return { msg: "Song successfully deleted from all collections!" };
    // return songCollections;
  }

  async deleteNoteFromCollection(songCollection: ObjectId, songifiedNote: ObjectId, update: Partial<SongCollectionDoc>) {
    // const collection = await this.songCollections.readOne({ songCollection });
    // for (const song of collection?.songifiedNotes){
    //     if (song)
    // }
    return await this.deleteNote({ $pull: { songCollection: { $in: songifiedNote } } }, update);
  }

  async deleteNoteFromAllCollections(songifiedNote: ObjectId, update: Partial<SongCollectionDoc>) {
    return await this.deleteNotes({ $pull: { songCollection: { $in: songifiedNote } } }, update);
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

  async upvote(query: Filter<SongCollectionDoc>, update: Partial<SongCollectionDoc>) {
    const posts = await this.songCollections.updateOne(query, update);
    return posts;
  }

  async doUpvote(songCollection: ObjectId) {
    return await this.upvote({ songCollection }, { upvotes: await this.updateUpvote(songCollection) });
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
