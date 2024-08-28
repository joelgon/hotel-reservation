import { model, Schema } from "mongoose";

export const lockItemSchema = new Schema({
    createdAt: { type: Date, default: Date.now },
});

export const LockItemModel = model('lock_item', lockItemSchema)