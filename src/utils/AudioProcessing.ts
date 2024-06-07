import path from "path";
import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import { ITextToSpeechBody } from "types/tts";

export class AudioProcessing {
  private client: TextToSpeechClient;
  constructor() {
    this.client = new TextToSpeechClient();
  }
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
  }
}
