import { HttpError } from "http-errors";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode || err.status || 500).json({
      message: err.message || err.name,
    });
  }

  // Обробка звичайних помилок
  const status = err.status || 500;

  return res.status(status).json({
    message: err.message || "Server error",
  });
};