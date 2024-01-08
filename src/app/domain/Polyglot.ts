import OpenAI from "openai";
import {
  JsonController,
  UseBefore,
  Get,
  Post,
  Body,
  Param,
  Req,
} from "routing-controllers";

import { ApiResponse } from "../../helpers/ApiResponse";
import { IPolyglotConversation } from "./Polyglot.types";
import { Authenticate } from "app/middlewares/authenticate";
import { AuthRequest } from "types/controllerAction";

import { db } from "Firebase";
import { openai } from "Chat";

@JsonController("/polyglot")
@UseBefore(Authenticate)
export default class Polyglot {
  @Post("/start-conversation")
  async startConversation(
    @Body() body: IPolyglotConversation,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;
    console.log(user);
    const response = await db
      .collection("user-info")
      .doc(user.uid)
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