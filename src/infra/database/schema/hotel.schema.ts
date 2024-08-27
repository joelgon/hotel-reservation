import { Schema } from "mongoose";

export const hotelSchema = new Schema({
    name: { type: String, required: true },
    rooms: { type: Number, required: true },
    dailyValue: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});