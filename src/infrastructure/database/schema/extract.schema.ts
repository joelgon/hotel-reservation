import { Schema } from "mongoose";

export const extractSchema = new Schema({
    customerId: String,
    description: String,
    value: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
})