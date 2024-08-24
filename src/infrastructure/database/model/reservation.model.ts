import { model } from "mongoose";
import { reservationSchme } from "../schema/reservation.shema";

export const reservationModel = model('reservation', reservationSchme)