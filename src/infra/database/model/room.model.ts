import { model } from "mongoose";
import { roomSchema } from "../schema/room.schema";

export const HotelModel = model('room', roomSchema)