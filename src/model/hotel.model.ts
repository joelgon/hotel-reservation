import { InferSchemaType, model, Schema } from "mongoose";

export const hotelSchema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});

export type Hotel = InferSchemaType<typeof hotelSchema> & { _id: string; };

export const HotelModel = model('hotel', hotelSchema)