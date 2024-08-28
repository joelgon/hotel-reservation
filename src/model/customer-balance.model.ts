import { InferSchemaType, model, Schema } from "mongoose";

export const customerBalanceSchema = new Schema({
    _id: { type: String, required: true },
    customerId: { type: String, required: true, unique: true, index: true, ref: 'customer' },
    value: { type: Number, required: true, },
})

export type CustomerBalance = InferSchemaType<typeof customerBalanceSchema>;

export const CustomerBalanceModel = model('customer_balance', customerBalanceSchema);