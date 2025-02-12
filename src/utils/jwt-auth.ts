import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import secrets from "../config/secret";
import Blacklist from "../model/blacklist.model";
import { getBearerToken, verifyToken } from "./token";

// jwt bearer token
export async function jwtAuth(req: Request, res: Response, next: NextFunction) {
  if (
    req.path.endsWith("/login") ||
    req.path.endsWith("/signup") ||
    req.path.endsWith("/reset-password") ||
    req.path.endsWith("/logout") ||
    req.path.endsWith("/forget-password") ||
    req.path.endsWith("/send-otp") ||
    req.path.endsWith("/verify-otp") ||
    !req.path.includes("/api/v1")
  ) {
    next();
    return;
  }

  try {
    const isTokenExist = await verifyToken(req);
    if (!isTokenExist) {
      throw new Error("Unauthorized");
    }

    const token = await getBearerToken(req);
    jwt.verify(token, secrets.jwt_secret, (err: any) => {
      if (err) {
        throw new Error("Forbidden");
      }
    });

    const isRevoked = await Blacklist.find({ token: token });
    if (isRevoked.length != 0) {
      throw new Error("Revoked");
    }

    // save auth info in request object
    saveAuthInfo(req, token);
    next();
  } catch (err: any) {
    return res.status(403).json({
      message: err.message,
    });
  }
}

/**
 * decrpty the header authorization token and save
 * the info in request object. later that info can be used
 */
async function saveAuthInfo(req: Request, token?: string) {
  try {
    if (!token) {
      throw new Error("Token not found");
    }

    const payload = jwt.decode(token);

    // setting req data
    //@ts-expect-error
    req.authId = payload.id;

    //@ts-expect-error
    req.role = payload.role;
  } catch (error) {
    throw error;
  }
}
