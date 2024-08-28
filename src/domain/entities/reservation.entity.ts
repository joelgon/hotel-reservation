import { Types } from "mongoose";

export interface reservationCreateEntity {
    customerId: string;
    hotelId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
}

export interface reservationEntity extends reservationCreateEntity {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}