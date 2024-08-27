import { Schema } from "mongoose";

export const reservationSchme = new Schema({
    customerId: { type: String, required: true, ref: 'customer' },
    hotelId: { type: String, required: true, index: true, ref: 'hotel' },
    roomId: { type: String, required: true, ref: 'room' },
    checkIn: { type: Date, required: true, index: true },
    checkOut: { type: Date, required: true, index: true },
    status: { 
        type: String, 
        enum: ['processing', 'success', 'error'], 
        required: true, 
        index: true 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
})