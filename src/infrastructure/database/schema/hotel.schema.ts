import { Schema } from "mongoose";

export const hotelSchema = new Schema({
    name: String,
    rooms: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});