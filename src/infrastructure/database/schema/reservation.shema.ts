import { Schema } from "mongoose";

export const reservationSchme = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'customer' },
    hotelId: { type: Schema.Types.ObjectId, ref: 'hotel' }
})