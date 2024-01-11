import { openai } from "Chat";
import { IPolyglotConversation } from "app/domain/Polyglot.types";
import OpenAI from "openai";

export class Assistant {
  constructor() {}

  async initAssitant(body: IPolyglotConversation): Promise<string> {
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

  async addMessageToThread(threadId, assitantId, content) {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });
    const runData = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assitantId,
    });
    let runStatus = runData.status;
    while (runStatus === "queued" || runStatus === "in_progress") {
      console.log("Polling for run status...");
      await new Promise((resolve) => setTimeout(resolve, 700));
      const statusData = await openai.beta.threads.runs.retrieve(
        threadId,
        runData.id,
      );
      console.log(`Current status: ${statusData.status}`);
      runStatus = statusData.status;
    }
    if (runStatus === "completed") {
      const messages = await openai.beta.threads.messages.list(threadId);
      for (let i = 0; i < messages.data.length; i++) {
        const message = messages.data[0].content;
        console.log(message);
      }
      return messages.data;
    }
  }
}
