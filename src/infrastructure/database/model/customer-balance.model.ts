import { model } from "mongoose";
import { customerBalanceSchema } from "../schema/customer-balance.schema";

export const CustomerBalanceModel = model('customer_balance', customerBalanceSchema);