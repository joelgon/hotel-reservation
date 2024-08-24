import { Schema } from "mongoose";

export const customerBalanceSchema = new Schema({
    customerId: String,
    value: Number,
})