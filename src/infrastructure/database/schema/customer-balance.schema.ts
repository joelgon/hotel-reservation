import { Schema } from "mongoose";

export const customerBalanceSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'customer' },
    value: Number,
})