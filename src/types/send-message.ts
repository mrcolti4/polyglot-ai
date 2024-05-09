import OpenAI from "openai";

export interface ISendMessage
  // Only "content" field
  extends Omit<
    OpenAI.Beta.Threads.MessageCreateParams,
    "role" | "file_ids" | "metadata"
  > {
  threadId: string;
  assistantId: string;
}
