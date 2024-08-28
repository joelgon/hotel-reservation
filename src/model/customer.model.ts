import { InferSchemaType, model, Schema } from 'mongoose';

export const customerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

export type Customer = InferSchemaType<typeof customerSchema> & { _id: string };

export const CustomerModel = model('customer', customerSchema);
