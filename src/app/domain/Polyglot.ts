import { JsonController, Get, Post, Body, Param } from "routing-controllers";
import { ApiResponse } from "../../helpers/ApiResponse";

import { IPolyglotConversation } from "./Polyglot.types";
import { db } from "Firebase";

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
}
