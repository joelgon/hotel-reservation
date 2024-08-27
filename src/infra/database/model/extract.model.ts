import { model } from "mongoose";
import { extractSchema } from "../schema/extract.schema";

export const ExtractModel = model('extract', extractSchema)