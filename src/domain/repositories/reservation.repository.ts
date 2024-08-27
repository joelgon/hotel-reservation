import { ClientSession } from "mongoose";
import { reservationCreateEntity, reservationEntity } from "../entities/reservation.entity";

export interface IReservationRequest {
    hotelId: string;
    checkIn: Date;
    checkOut: Date;
}

export interface IReservationRepository {
    create(reservationData: reservationCreateEntity, session?: ClientSession): Promise<reservationEntity>;
    conflictReservations(args: IReservationRequest): Promise<string[]>;
}