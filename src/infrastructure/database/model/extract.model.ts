import { model } from "mongoose";
import { extractSchema } from "../schema/extract.schema";

export const extractModel = model('extract', extractSchema)