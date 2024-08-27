import { model } from "mongoose";
import { lockItemSchema } from "../schema/lock-item.schema";

export const LockItemModel = model('lock_item', lockItemSchema)