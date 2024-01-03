import OpenAI from "openai";
import { JsonController, Get, Post, Body, Param } from "routing-controllers";

import { ApiResponse } from "../../helpers/ApiResponse";
import { IPolyglotConversation } from "./Polyglot.types";

import { db } from "Firebase";
import { openai } from "Chat";

@JsonController("/polyglot")
export default class Polyglot {
  @Post("/start-conversation/:id")
  async startConversation(
    @Body() body: IPolyglotConversation,
    @Param("id") id: string,
  ) {
    const response = await db
      .collection("user-info")
      .doc(id)
      .update({ conversations: [{ ...body }] });

    return new ApiResponse(true, body, `Update document ${response}`);
  }

  @Post("/send-message")
  async sendMessageToAi(@Body() body: OpenAI.Chat.ChatCompletionMessage) {
    const { role, content } = body;
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are helpful assistant. Answer on questions.",
        },
        { role, content },
      ],
    };
    const response: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(params);

    return new ApiResponse(true, response, "Chat gave answer");
  }
}
