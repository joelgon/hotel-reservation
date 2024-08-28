import { InferSchemaType, model, Schema } from "mongoose";

export const reservationSchema = new Schema({
    _id: { type: String, required: true },
    customerId: { type: String, required: true, ref: 'customer' },
    hotelId: { type: String, required: true, index: true, ref: 'hotel' },
    roomId: { type: String, required: true, ref: 'room' },
    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});

export type Reservation = InferSchemaType<typeof reservationSchema>;

export const ReservationModel = model('reservation', reservationSchema)