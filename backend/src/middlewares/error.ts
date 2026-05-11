import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler.js";
import { ZodError } from "zod";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // 1. Zod Validation Error Handle karna
  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => `${issue.path.join(".")} is ${issue.message}`).join(", ");
    err = new ErrorHandler(400, message);
  }

  // 2. PostgreSQL Unique Constraint Error (e.g., Duplicate Email)
  if (err.code === "23505") {
    err.message = "Duplicate field value entered";
    err.statusCode = 400;
  }

  // 3. PostgreSQL Foreign Key Violation
  if (err.code === "23503") {
    err.message = "Related record not found";
    err.statusCode = 404;
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // Dev mein stack trace dikhao, Prod mein nahi
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};