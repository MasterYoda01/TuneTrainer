import OpenAI from "openai";

const openai = new OpenAI();

export async function generateSongLyrics(rawNote: string, lyricsTemplate: string) {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `## Instruction ## You are smart bot that turns study notes into music. You help users study by rewriting their notes.
          as lyrics of famous songs. You will be given the (2) lyrics of that song to parody and (3) student's study notes to rewrite into song. Only add one \n at the end of each line of the song.
          `,
        },
        { role: "user", content: `## Here are the study notes to use for the lyrics ${rawNote}. ## Here is the lyricsTemplate, generate same number of lines: ${lyricsTemplate}` },
      ],
      model: "gpt-4",
    });
    console.log(response);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
