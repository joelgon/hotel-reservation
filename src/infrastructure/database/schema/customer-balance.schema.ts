import { Schema } from "mongoose";

export const customerBalanceSchema = new Schema({
    customerId: { type: String, required: true, unique: true },
    value: { type: Number, required: true, },
})