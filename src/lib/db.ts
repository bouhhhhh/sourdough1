import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI must be defined");

let cached = (global as any)._mongooseConn as Promise<typeof mongoose> | undefined;

export function connectDB() {
  if (!cached) {
    cached = mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || "app" });
    (global as any)._mongooseConn = cached;
  }
  return cached;
}
