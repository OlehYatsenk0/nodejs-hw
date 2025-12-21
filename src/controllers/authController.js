import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
import createHttpError from "http-errors";

import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { createSession, setSessionCookies } from "../services/auth.js";
import { sendMail } from "../utils/sendMail.js";

const { JWT_SECRET, FRONTEND_DOMAIN } = process.env;

// ===================== helpers =====================
const clearSessionCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
  res.clearCookie("sessionId", options);
};

// ===================== auth =====================
export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw createHttpError(400, "Email in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createHttpError(401, "Invalid credentials");
    }

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies || {};

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) {
      throw createHttpError(401, "Session not found");
    }

    if (session.refreshTokenValidUntil.getTime() < Date.now()) {
      throw createHttpError(401, "Session token expired");
    }

    await Session.deleteOne({ _id: session._id });

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: "Session refreshed" });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies || {};

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    clearSessionCookies(res);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ===================== password reset =====================
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // ❗ завжди 200
    if (!user) {
      return res.status(200).json({
        message: "Password reset email sent successfully",
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${FRONTEND_DOMAIN}/reset-password?token=${token}`;

    const templatePath = path.resolve(
      "src",
      "templates",
      "reset-password-email.html"
    );

    const source = await fs.readFile(templatePath, "utf-8");
    const template = handlebars.compile(source);

    const html = template({
      username: user.username,
      resetLink,
    });

    await sendMail({
      to: email,
      subject: "Password reset",
      html,
    });

    res.status(200).json({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    next(
      createHttpError(
        500,
        "Failed to send the email, please try again later."
      )
    );
  }
};