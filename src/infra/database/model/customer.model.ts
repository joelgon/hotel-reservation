import { model } from "mongoose";
import { customerSchema } from "../schema/customer.schema";

export const CustomerModel = model('customer', customerSchema);