import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type UserDoc = {
  _id: string;
  email: string;
  passwordHash: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const User = (models?.User as mongoose.Model<UserDoc>) || model<UserDoc>("User", UserSchema);

