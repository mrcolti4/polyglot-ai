import admin from "firebase-admin";
import { JsonController, Get, Post, Body, Param } from "routing-controllers";

import { IUserInfo, IUserRegister, IUserResetPassword } from "./User.type";
import { ApiResponse } from "helpers/ApiResponse";
import { db } from "Firebase";

@JsonController("/user")
export default class User {
  @Post("/create")
  async registerNewUser(@Body() body: IUserRegister) {
    const { email, password, displayName, subscription } = body;
    const auth = admin.auth();

    const user = await auth.createUser({ email, password, displayName });
    const token = await auth.createCustomToken(user.uid);
    await db.collection("user-info").doc(user.uid).set({ subscription, token });

    return new ApiResponse(
      true,
      user,
      `Created a new user with ${user.uid} id`,
    );
  }

  @Post("/update/:id")
  async updateUser(@Body() body: IUserInfo, @Param("id") id: string) {
    const response = await admin.auth().updateUser(id, body);

    return new ApiResponse(true, response, `${response.toJSON()}`);
  }

  @Post("/reset-password")
  async resetPassword(@Body() body: IUserResetPassword) {
    const { email } = body;

    const resetLink = await admin.auth().generatePasswordResetLink(email);

    return new ApiResponse(true, resetLink, `Password reseted`);
  }
}
