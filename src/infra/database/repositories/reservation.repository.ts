import { ClientSession } from "mongoose";
import { ReservationModel } from "../model/reservation.model";

export class ReservationRepository {
    async create(reservationData, session?: ClientSession) {
        const reservationModel = new ReservationModel(reservationData);
        const reservation = await reservationModel.save({ session });

        return reservation.toObject();
    }

    async conflictReservations({ hotelId, checkIn, checkOut }): Promise<string[]> {
        return ReservationModel.distinct('roomId', {
            hotelId,
            status: 'success',
            checkIn: {
                $gte: checkIn,
                $lte: checkOut
            }
        }).exec();

    }
}