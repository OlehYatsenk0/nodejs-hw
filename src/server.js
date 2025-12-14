import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errors as celebrateErrors } from "celebrate";

import { connectMongoDB } from "./db/connectMongoDB.js";
import notesRouter from "./routes/notesRoutes.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors()); // ✅ ДОДАНО
app.use(express.json());
app.use(logger);

// ❗️ БЕЗ "/notes"
app.use(notesRouter);

app.use(notFoundHandler);
app.use(celebrateErrors());
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