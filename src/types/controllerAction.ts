import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export interface AuthRequest extends Request {
  user: DecodedIdToken;
}
