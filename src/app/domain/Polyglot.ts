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
import { AuthRequest, TypedRequest } from "types/controllerAction";

import { AudioProcessing } from "utils/AudioProcessing";
import { Assistant } from "utils/Assistant";
import { db, bucket } from "utils/Firebase";

import { ApiResponse } from "helpers/ApiResponse";
import { ApiError } from "helpers/ApiError";

import { Authenticate } from "app/middlewares/authenticate";
import { voice } from "types/tts";
import { PassThrough } from "stream";

@JsonController("/polyglot")
@UseBefore(Authenticate)
export default class Polyglot {
  private AudioProcess: AudioProcessing = new AudioProcessing();
  private AssistantApi: Assistant = new Assistant();
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
      `Current conversation: ${currentConv.id}`,
    );
  }

  @Post("/start-conversation")
  async startConversation(
    @Body() body: IAssistantInstructions,
    @Req() req: AuthRequest,
  ) {
    let { AssistantApi } = this;
    const { user } = req;
    // Initialize assistent with given roles
    const assistantId = await AssistantApi.initAssitant(body);
    // Create separate thread for conversation
    const threadId = await AssistantApi.createThread();
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
  async sendMessageToAi(
    @Req() req: TypedRequest<{ lang: string; voice: voice }>,
    @Body() body: ISendMessage,
  ) {
    const { user } = req;
    const { AssistantApi, AudioProcess } = this;
    const { lang, voice } = req.query;
    // Get response from assistant
    const response = await AssistantApi.addMessageToThread(body);
    console.log(response);

    // Get audio content, format base64
    const audioContent = await AudioProcess.TTS({
      text: response[0].value,
      languageCode: lang,
      ssmlGender: voice,
    });
    // Save file via createWriteStream
    const file = bucket.file(
      `messageSpeech/${body.threadId}/${response[0].messageId}.wav`,
    );
    // Create write/read stream and pass audio buffer
    const bufferStream = new PassThrough();
    bufferStream.end(Buffer.from(audioContent));
    bufferStream
      .pipe(
        file.createWriteStream({
          metadata: {
            contentType: "audio/mpeg",
          },
        }),
      )
      // On file write error return response
      .on("error", () => {
        return new ApiResponse(true, response, `Assistant respond!`);
      })
      // On file write success return response with audioUrl
      .on("finish", () => {
        console.log("finished: " + file.publicUrl());
        response[0].audioUrl = file.publicUrl();
        return new ApiResponse(true, response, "Link: " + file.publicUrl());
      });

    return new ApiResponse(true, response, `Assistant respond!`);
  }
}
