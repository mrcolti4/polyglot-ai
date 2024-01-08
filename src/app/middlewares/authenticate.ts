import type { NextFunction, Response } from "express";
import type { ExpressMiddlewareInterface } from "routing-controllers";
import admin from "firebase-admin";

import { ApiError } from "../../helpers/ApiError";
import { AuthRequest } from "../../types/controllerAction";

export class Authenticate implements ExpressMiddlewareInterface {
  async use(request: AuthRequest, response: Response, next: NextFunction) {
    const { authorization = "" } = request.headers;
    const [bearer, token] = authorization.split(" ");
    const auth = admin.auth();
    if (bearer !== "Bearer") {
      throw new ApiError(401, {
        code: "UNAUTHORIZED",
        message: "Bearer not provided",
      });
    }
    try {
      const user = await auth.verifyIdToken(token);

      if (!user) {
        throw new ApiError(401, {
          code: "INVALID_TOKEN",
          message: "Token is not valid",
        });
      }

      request.user = user;

      next();
    } catch (error) {
      next(
        new ApiError(401, { code: "UNAUTHORIZED", message: "Not authorized" }),
      );
    }
  }
}
