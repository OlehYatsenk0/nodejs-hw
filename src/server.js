import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errors as celebrateErrors } from "celebrate";

import { connectMongoDB } from "./db/connectMongoDB.js";

import authRouter from "./routes/authRoutes.js";
import notesRouter from "./routes/notesRoutes.js";
import userRouter from "./routes/userRoutes.js";

import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// потрібно для cookie (sameSite: 'none') + запитів з фронту
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(logger);

// маршрути
app.use(authRouter);
app.use(notesRouter);
app.use(userRouter);

// 404
app.use(notFoundHandler);

// celebrate errors
app.use(celebrateErrors());

// загальні помилки
app.use(errorHandler);

const { PORT = 3000, MONGO_URL } = process.env;

const start = async () => {
  try {
    await connectMongoDB(MONGO_URL);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
};

start();