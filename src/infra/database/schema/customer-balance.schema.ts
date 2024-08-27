import { Schema } from "mongoose";

export const customerBalanceSchema = new Schema({
    customerId: { type: String, required: true, unique: true, index: true, ref: 'customer' },
    value: { type: Number, required: true, },
    lock: { type: Boolean, require: true, default: false, index: true }
})