import type { Request, Response } from "express";
import mongoose from "mongoose";

export const getHealth = (
  _req: Request,
  res: Response,
): void => {
  const databaseConnected =
    mongoose.connection.readyState === 1;

  res.status(200).json({
    success: true,
    service: "workday-ai-api",
    status: "healthy",
    database: databaseConnected
      ? "connected"
      : "disconnected",
    timestamp: new Date().toISOString(),
  });
};