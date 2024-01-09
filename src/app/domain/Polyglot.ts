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
import { ApiError } from "helpers/ApiError";

@JsonController("/polyglot")
@UseBefore(Authenticate)
export default class Polyglot {
  @Get("/get-info")
  async getSecretInfo() {
    const data = await db
      .collection("secured-info")
      .doc("UCRw3hIrBb1GBiSuBukr")
      .get();
    if (!data.exists) {
      return new ApiError(404, { code: "NOT_FOUND", message: "Not found" });
    }

    return new ApiResponse(true, data.data(), `Get secured data`);
  }

  @Post("/start-conversation")
  async startConversation(
    @Body() body: IPolyglotConversation,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;
    const userInfo = db.collection("user-info").doc(user.uid);
    const userDoc = await userInfo.get();
    if (userDoc.exists) {
      userInfo.update({ conversation: [{ ...body }] });

      return new ApiResponse(true, body, `Update document ${user.uid}`);
    } else {
      userInfo.create({ conversation: [{ ...body }] });

      return new ApiResponse(true, body, `Create document ${user.uid}`);
    }
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
