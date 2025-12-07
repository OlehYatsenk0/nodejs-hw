import express from "express";
import dotenv from "dotenv";
import { errors as celebrateErrors } from "celebrate";

import { connectMongoDB } from "./db/connectMongoDB.js";
import notesRouter from "./routes/notesRoutes.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(logger);

// маршрути
app.use("/notes", notesRouter);

// 404 – неіснуючі маршрути
app.use(notFoundHandler);

// помилки валідації celebrate
app.use(celebrateErrors());

// загальний обробник помилок
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