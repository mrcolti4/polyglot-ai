import { Request } from "express";
import { Query } from "express-serve-static-core";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export interface AuthRequest extends Request {
  user: DecodedIdToken;
}

export interface TypedRequest<T extends Query> extends AuthRequest {
  query: T
}
