import { openai } from "utils/OpenAI";
import { ISendMessage } from "types/send-message";
import { IAssistantInstructions } from "types/assistant-instructions";
import OpenAI from "openai";

interface IMessageObject {
    role: "user" | "assistant";
    value: string;
    annotations: (OpenAI.Beta.Threads.Messages.MessageContentText.Text.FileCitation | OpenAI.Beta.Threads.Messages.MessageContentText.Text.FilePath)[]
}

export class Assistant {
  constructor() {}

  async initAssitant(body: IAssistantInstructions): Promise<string> {
    const assistant = await openai.beta.assistants.create({
      name: "Polyglot",
      instructions: `Please address the user as ${body.userRole}. Play the role of ${body.chatRole}. Answer only in ${body.language}`,
      model: "gpt-3.5-turbo",
    });
    return assistant.id;
  }

  async createThread(): Promise<string> {
    const thread = await openai.beta.threads.create();

    return thread.id;
  }

  async addMessageToThread(body: ISendMessage): Promise<IMessageObject[]> {
      const { threadId, assistantId, content } = body;
      const message = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content,
      });
      const runData = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
      });
      let runStatus = runData.status;
      while (runStatus === "queued" || runStatus === "in_progress") {
        console.log("Polling for run status...");
        await new Promise((resolve) => setTimeout(resolve, 700));
        const statusData = await openai.beta.threads.runs.retrieve(
          threadId,
          runData.id
        );
        console.log(`Current status: ${statusData.status}`);
        runStatus = statusData.status;
      }
      if (runStatus === "completed") {
        const { data } = await openai.beta.threads.messages.list(threadId);
        const messages: IMessageObject[] = data.flatMap(
          (message) =>
            message?.content.map((content) =>
              content.type === "text"
                ? {
                      role: message.role,
                      ...content.text,
                  }
                : 
                {
                  role: message.role,
                  value: "",
                  annotations: [],
                }
            )
        );

        return messages;
      }
      else {
        return []
      }
  }
}
