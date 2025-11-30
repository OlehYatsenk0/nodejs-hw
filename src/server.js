import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Підключення до MongoDB перед запуском сервера
await connectMongoDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Маршрути нотаток
app.use(notesRoutes);

// 404
app.use(notFoundHandler);

// Error handler (останній у стеку)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});