import OpenAI from "openai";

export interface IAudioSave
  extends Pick<OpenAI.Beta.Threads.ThreadMessage, "role"> {
  convId: string;
  messageId: string;
}
