import { ClientSession } from "mongoose";
import { Reservation, ReservationModel } from "../model/reservation.model";

export class ReservationRepository {
    async create(reservationData: { customerId: string; hotelId: string; roomId: string; checkIn: Date; checkOut: Date; }, session?: ClientSession): Promise<Reservation> {
        const reservationModel = new ReservationModel(reservationData);
        const reservation = await reservationModel.save({ session });

        return reservation.toObject();
    }

    async conflictReservations({ hotelId, checkIn, checkOut }): Promise<string[]> {
        return ReservationModel.distinct('roomId', {
            hotelId,
            checkIn: {
                $gte: checkIn,
                $lte: checkOut
            }
        }).exec();

    }
}