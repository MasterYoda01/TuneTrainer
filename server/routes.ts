import { Router, getExpressRouter } from "./framework/router";

import { SongifiedNote, User, WebSession } from "./app";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";

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

  @Router.patch("/edit/generatedlyrics/songifiednote")
  async editGeneratedLyrics(_id: string, newLyrics: string) {
    await SongifiedNote.editGeneratedLyrics(_id, newLyrics);
    return { msg: "Generated lyrics updated!" };
  }

  @Router.patch("/edit/rawnote/songifiednote")
  async editRawNote(_id: string, newRawNote: string) {
    await SongifiedNote.editRawNote(_id, newRawNote);
    return { msg: "Raw note updated!" };
  }
}

export default getExpressRouter(new Routes());
