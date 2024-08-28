import { InferSchemaType, model, Schema } from "mongoose";

export const roomSchema = new Schema({
    _id: { type: String, required: true },
    hotelId: { type: String, ref: 'Hotel', required: true },
    roomNumber: { type: Number, required: true },
    dailyValue: { type: Number, required: true },
});

export type Room = InferSchemaType<typeof roomSchema>;

export const RoomModel = model('room', roomSchema)