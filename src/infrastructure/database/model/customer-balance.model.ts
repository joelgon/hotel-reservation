import { model } from "mongoose";
import { customerBalanceSchema } from "../schema/customer-balance.schema";

export const customerBalanceModel = model('customer_balance', customerBalanceSchema);