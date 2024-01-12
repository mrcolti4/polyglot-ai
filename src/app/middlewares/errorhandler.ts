import { Request, Response, NextFunction } from "express";
import { ApiError } from "helpers/ApiError";
import { NotFoundError } from "openai";
import {
  ExpressErrorMiddlewareInterface,
  Middleware,
} from "routing-controllers";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, req: Request, res: Response, next: NextFunction): void {
    console.log(error);
    if (error instanceof ApiError) {
      res.status(error.httpCode).json({ error: error.message });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({ error: "Not Found" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
