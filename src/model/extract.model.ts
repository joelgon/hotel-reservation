import { InferSchemaType, model, Schema } from "mongoose";

export const extractSchema = new Schema({
    _id: { type: String, required: true },
    customerId: { type: String, required: true, index: true, ref: 'customer' },
    description: { type: String, required: true },
    value: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null }
});

export type Extract = InferSchemaType<typeof extractSchema>;

export const ExtractModel = model('extract', extractSchema)