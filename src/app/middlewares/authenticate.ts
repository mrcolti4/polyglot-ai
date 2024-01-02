import type { NextFunction, Request, Response } from "express";
import type { ExpressMiddlewareInterface } from "routing-controllers";
import { Middleware } from "routing-controllers";
import admin from "firebase-admin";

import { ApiError } from "../../helpers/ApiError";

@Middleware({ type: "before" })
export class Authenticate implements ExpressMiddlewareInterface {
  async use(request: Request, response: Response, next: NextFunction) {
    const { authorization = "" } = request.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      throw new ApiError(401, {
        code: "UNAUTHORIZED",
        message: "Bearer not provided",
      });
    }
    try {
      const isValid = await admin.auth().verifyIdToken(token);

      if (!isValid) {
        throw new ApiError(401, {
          code: "INVALID_TOKEN",
          message: "Token is not valid",
        });
      }

      next();
    } catch (error) {
      next(
        new ApiError(401, { code: "UNAUTHORIZED", message: "Not authorized" }),
      );
    }
  }
}
