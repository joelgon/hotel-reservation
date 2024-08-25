import { model } from "mongoose";
import { hotelSchema } from "../schema/hotel.schema";

export const HotelModel = model('hotel', hotelSchema)