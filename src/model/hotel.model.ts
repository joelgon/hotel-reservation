import { InferSchemaType, model, Schema } from "mongoose";

export const hotelSchema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});

export type Hotel = InferSchemaType<typeof hotelSchema>;

export const HotelModel = model('hotel', hotelSchema)