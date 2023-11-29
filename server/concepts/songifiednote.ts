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

  // async create(username: string, password: string) {
  //   await this.canCreate(username, password);
  //   const _id = await this.users.createOne({ username, password });
  //   return { msg: "User created successfully!", user: await this.users.readOne({ _id }) };
  // }

  // private sanitizeUser(user: UserDoc) {
  //   // eslint-disable-next-line
  //   const { password, ...rest } = user; // remove password
  //   return rest;
  // }

  // async getUserById(_id: ObjectId) {
  //   const user = await this.users.readOne({ _id });
  //   if (user === null) {
  //     throw new NotFoundError(`User not found!`);
  //   }
  //   return this.sanitizeUser(user);
  // }

  // async getUserByUsername(username: string) {
  //   const user = await this.users.readOne({ username });
  //   if (user === null) {
  //     throw new NotFoundError(`User not found!`);
  //   }
  //   return this.sanitizeUser(user);
  // }

  // async idsToUsernames(ids: ObjectId[]) {
  //   const users = await this.users.readMany({ _id: { $in: ids } });

  //   // Store strings in Map because ObjectId comparison by reference is wrong
  //   const idToUser = new Map(users.map((user) => [user._id.toString(), user]));
  //   return ids.map((id) => idToUser.get(id.toString())?.username ?? "DELETED_USER");
  // }

  // async getUsers(username?: string) {
  //   // If username is undefined, return all users by applying empty filter
  //   const filter = username ? { username } : {};
  //   const users = (await this.users.readMany(filter)).map(this.sanitizeUser);
  //   return users;
  // }

  // async authenticate(username: string, password: string) {
  //   const user = await this.users.readOne({ username, password });
  //   if (!user) {
  //     throw new NotAllowedError("Username or password is incorrect.");
  //   }
  //   return { msg: "Successfully authenticated.", _id: user._id };
  // }

  // async update(_id: ObjectId, update: Partial<UserDoc>) {
  //   if (update.username !== undefined) {
  //     await this.isUsernameUnique(update.username);
  //   }
  //   await this.users.updateOne({ _id }, update);
  //   return { msg: "User updated successfully!" };
  // }

  // async delete(_id: ObjectId) {
  //   await this.users.deleteOne({ _id });
  //   return { msg: "User deleted!" };
  // }

  // async userExists(_id: ObjectId) {
  //   const maybeUser = await this.users.readOne({ _id });
  //   if (maybeUser === null) {
  //     throw new NotFoundError(`User not found!`);
  //   }
  // }

  // private async canCreate(username: string, password: string) {
  //   if (!username || !password) {
  //     throw new BadValuesError("Username and password must be non-empty!");
  //   }
  //   await this.isUsernameUnique(username);
  // }

  // private async isUsernameUnique(username: string) {
  //   if (await this.users.readOne({ username })) {
  //     throw new NotAllowedError(`User with username ${username} already exists!`);
  //   }
  // }
}
