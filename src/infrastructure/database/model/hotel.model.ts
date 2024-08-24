import { model } from "mongoose";
import { hotelSchema } from "../schema/hotel.schema";

export const hotelModel = model('hotel', hotelSchema)