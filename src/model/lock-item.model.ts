import { InferSchemaType, model, Schema } from "mongoose";

export const lockItemSchema = new Schema({
    _id: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export type LockItem = InferSchemaType<typeof lockItemSchema>;

export const LockItemModel = model('lock_item', lockItemSchema)