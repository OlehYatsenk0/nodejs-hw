import crypto from "crypto";
import { Session } from "../models/session.js";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/time.js";

const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export const createSession = async (userId) => {
  const accessToken = generateToken(32);
  const refreshToken = generateToken(32);

  const now = Date.now();

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + ONE_DAY),
  });

  return session;
};

export const setSessionCookies = (res, session) => {
  const cookieOptionsBase = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("accessToken", session.accessToken, {
    ...cookieOptionsBase,
    maxAge: FIFTEEN_MINUTES,
  });

  res.cookie("refreshToken", session.refreshToken, {
    ...cookieOptionsBase,
    maxAge: ONE_DAY,
  });

  res.cookie("sessionId", String(session._id), {
    ...cookieOptionsBase,
    maxAge: ONE_DAY,
  });
};