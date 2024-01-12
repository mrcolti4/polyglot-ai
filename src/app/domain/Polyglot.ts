import admin from "firebase-admin";
import {
  JsonController,
  UseBefore,
  Get,
  Post,
  Body,
  Param,
  Req,
} from "routing-controllers";
import { v4 as uuid } from "uuid";

import { IAssistantInstructions } from "types/assistant-instructions";
import { ISendMessage } from "types/send-message";
import { AuthRequest } from "types/controllerAction";
import { Assistant } from "utils/Assistant";
import { db } from "utils/Firebase";
import { ApiResponse } from "helpers/ApiResponse";
import { ApiError } from "helpers/ApiError";
import { Authenticate } from "app/middlewares/authenticate";

@JsonController("/polyglot")
@UseBefore(Authenticate)
export default class Polyglot {
  private assistantApi: Assistant = new Assistant();
  @Get("/get-info")
  async getSecretInfo(@Req() req: AuthRequest) {
    const { user } = req;
    const data = await db.collection("secured-info").doc(user.uid).get();
    if (!data.exists) {
      return new ApiError(404, { code: "NOT_FOUND", message: "Not found" });
    }

    return new ApiResponse(true, data.data(), `Get secured data`);
  }

  @Get("/get-current-conversation/:id")
  async getCurrentConversation(
    @Req() req: AuthRequest,
    @Param("id") id: string,
  ) {
    const { user } = req;
    const userRef = db.collection("user-info").doc(user.uid);
    const userData = await userRef.get();
    const convArr = <any[]>userData.data()?.conversations;

    const currentConv = convArr.find((item, i, arr) => item.id === id);

    return new ApiResponse(
      true,
      currentConv,
      `Current conversation: ${currentConv.threadId}`,
    );
  }

  @Post("/start-conversation")
  async startConversation(
    @Body() body: IAssistantInstructions,
    @Req() req: AuthRequest,
  ) {
    let { assistantApi } = this;
    const { user } = req;
    // Initialize assistent with given roles
    const assistantId = await assistantApi.initAssitant(body);
    // Create separate thread for conversation
    const threadId = await assistantApi.createThread();
    const id = uuid();
    const convObj = {
      id,
      threadId,
      assistantId,
      convInfo: { ...body },
    };
    const userRef = db.collection("user-info").doc(user.uid);

    await userRef.update({
      conversations: admin.firestore.FieldValue.arrayUnion(convObj),
    });

    return new ApiResponse(
      true,
      { id, threadId, assistantId },
      `Create conversation thread: ${threadId}, assistant: ${assistantId}`,
    );
  }

  @Post("/send-message")
  async sendMessageToAi(@Req() req: AuthRequest, @Body() body: ISendMessage) {
    const { user } = req;
    const { assistantApi } = this;

    const messages = await assistantApi.addMessageToThread(body);

    const responseObj = {
      [body.threadId]: messages,
    };

    db.collection("user-info")
      .doc(user.uid)
      .update({ messages: admin.firestore.FieldValue.arrayUnion(responseObj) });

    return new ApiResponse(true, messages, `Assistant respond!`);
  }
}
