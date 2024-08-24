import { model } from "mongoose";
import { customerSchema } from "../schema/customer.schema";

export const customerModel = model('customer', customerSchema);