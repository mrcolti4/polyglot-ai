import admin from "firebase-admin";
import {
  JsonController,
  Get,
  Post,
  Body,
  Param,
  Res,
} from "routing-controllers";

import { IUserInfo, IUserRegister } from "./User.type";
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
    const response = await db
      .collection("user-info")
      .doc(user.uid)
      .set({ subscription });

    console.log(response);

    return new ApiResponse(
      true,
      user,
      `Created a new user with ${user.uid} id`
    );
  }

  @Post("/update/:id")
  async updateUser(@Body() body: IUserInfo, @Param("id") id: string) {
    const response = await admin.auth().updateUser(id, body);

    return new ApiResponse(true, response, `${response.toJSON()}`);
  }
}
