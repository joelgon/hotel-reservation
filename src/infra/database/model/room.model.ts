import { model } from "mongoose";
import { roomSchema } from "../schema/room.schema";

export const RoomModel = model('room', roomSchema)