import { Schema } from "mongoose";

export const reservationSchme = new Schema({
    customerId: String,
    hotelId: String,
    checkIn: Date,
    checkOut: Date,
})