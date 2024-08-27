import { Schema } from "mongoose";

export const lockItemSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
});