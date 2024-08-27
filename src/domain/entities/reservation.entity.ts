import { Types } from "mongoose";

export interface reservationCreateEntity {
    customerId: string;
    hotelId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    status: 'processing' | 'success' | 'error';
}

export interface reservationEntity extends reservationCreateEntity {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}