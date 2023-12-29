import admin from "firebase-admin";
import {
  JsonController,
  Get,
  Post,
  Body,
  Param,
  Res,
} from "routing-controllers";

import { IUserRegister } from "./User.type";
import { ApiResponse } from "helpers/ApiResponse";
import { db } from "Firebase";

@JsonController("/user")
export default class User {
  @Post()
  async registerNewUser(@Body() body: IUserRegister) {
    const { email, password, displayName, subscription } = body;

    const user = await admin
      .auth()
      .createUser({ email, password, displayName });
    const response = await db.collection("users").doc().set({ subscription });

    console.log(response);

    return new ApiResponse(
      true,
      user,
      `Created a new user with ${user.uid} id`
    );
  }
}
