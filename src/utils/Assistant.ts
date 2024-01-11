import OpenAI from "openai";
import { openai } from "../Chat";

export interface IPolyglotConversation {
  chatRole: string;
  userRole: string;
  language: string;
}

export class Assistant {
  private static instance: Assistant;
  protected conversation: IPolyglotConversation;
  private assistant: OpenAI.Beta.Assistant;
  /**
   *
   */

  constructor() {
    if (!Assistant.instance) {
      Assistant.instance = this;
    }

    return Assistant.instance;
  }

  async init(
    conversation: IPolyglotConversation,
  ): Promise<OpenAI.Beta.Assistant> {
    return await openai.beta.assistants.create({
      name: "Polyglot",
      instructions: `Please address the user as ${conversation.userRole}. Play the role of ${conversation.chatRole}. Answer only in ${conversation.language}.`,
      model: "gpt-3.5-turbo",
    });
  }

  async createThread(): Promise<string> {
    const thread = await openai.beta.threads.create();

    return thread.id;
  }

  async addMesageToThread(
    threadId: string,
    assistantId: string,
    content: string,
  ) {
    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content,
    });
    // Run thread and waiting response from assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    // Waiting until the status will change on completed
    let runStatus = run.status;
    while (runStatus === "queued" || runStatus === "in_progress") {
      await new Promise((resolve) => setTimeout(resolve, 700));
      // Check current status
      const statusData = await openai.beta.threads.runs.retrieve(
        threadId,
        run.id,
      );

      runStatus = statusData.status;
      console.log(`Current status: ${runStatus}`);
    }
    // If status is completed we are returning the last messages from thread
    if (runStatus === "completed") {
      const messages = await openai.beta.threads.messages.list(threadId);
      for (let i = 0; i < messages.data.length; i++) {
        const element = messages.data[i];
        console.log(element.content[0]);
        console.log(element.content);
      }
      return messages.data;
    }
  }
}
