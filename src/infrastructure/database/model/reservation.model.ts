import { model } from "mongoose";
import { reservationSchme } from "../schema/reservation.shema";

export const ReservationModel = model('reservation', reservationSchme)