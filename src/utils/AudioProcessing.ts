import { openai } from "./OpenAI";
import path from "path";
import fs from "fs";
import util from "util";
import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import { ITextToSpeechBody } from "types/tts";
import { PassThrough } from "stream";

export class AudioProcessing {
  private client: TextToSpeechClient;
  constructor() {
    this.client = new TextToSpeechClient();
  }
  // static async TTS(text: string) {
  //     const speechFile = path.resolve("/temp/speech.mp3")

  //     const speech = await openai.audio.speech.create({
  //         model: "tts-1",
  //         voice: "alloy",
  //         input: "Today is wonderful day"
  //     })
  //     console.log(speechFile);
  //     const buffer = Buffer.from(await speech.arrayBuffer());
  //     await fs.promises.writeFile(speechFile, buffer);
  // }
  async TTS(requestBody: ITextToSpeechBody) {
    const speechFile = path.resolve("./src/temp/speech.mp3");
    const { text, languageCode, ssmlGender } = requestBody;
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
      {
        input: { text },
        // Select the language and SSML voice gender (optional)
        voice: { languageCode, ssmlGender },
        // select the type of audio encoding
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
        },
      };

    const [response] = await this.client.synthesizeSpeech(request);
    if (!response.audioContent) return "Error";
    return response.audioContent;
    // const bufferStream = new PassThrough();
    // bufferStream.end(Buffer.from(response.audioContent));
    
    // return bufferStream;
    // const writeFile = util.promisify(fs.writeFile);
    // await writeFile(speechFile, response.audioContent as Buffer, "binary");
  }
}
