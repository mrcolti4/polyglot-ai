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

@JsonController("/user")
export default class User {
  @Post()
  async registerNewUser(@Body() body: IUserRegister) {
    const user = await admin.auth().createUser(body);

    return new ApiResponse(
      true,
      user,
      `Created a new user with ${user.uid} id`
    );
  }
}
