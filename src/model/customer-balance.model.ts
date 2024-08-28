import { model, Schema } from "mongoose";

export const customerBalanceSchema = new Schema({
    customerId: { type: String, required: true, unique: true, index: true, ref: 'customer' },
    value: { type: Number, required: true, },
})

export const CustomerBalanceModel = model('customer_balance', customerBalanceSchema);