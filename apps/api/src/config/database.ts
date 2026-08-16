import mongoose from "mongoose";

import { env } from "./env.js";

let connectionPromise: Promise<typeof mongoose> | null =
  null;

export const connectDatabase =
  async (): Promise<void> => {
    if (
      mongoose.connection.readyState === 1
    ) {
      return;
    }

    if (!connectionPromise) {
      connectionPromise =
        mongoose.connect(
          env.MONGODB_URI,
        );
    }

    try {
      await connectionPromise;

      console.log(
        "MongoDB connected",
      );
    } catch (error) {
      connectionPromise = null;

      console.error(
        "MongoDB connection failed",
      );

      if (
        error instanceof Error
      ) {
        console.error(
          error.message,
        );
      }

      throw error;
    }
  };

export const disconnectDatabase =
  async (): Promise<void> => {
    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.disconnect();
    }

    connectionPromise = null;
  };