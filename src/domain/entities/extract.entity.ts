import { Types } from "mongoose";

export interface extractCreateEntity {
    customerId: string;
    description: string;
    value: number;
}

export interface extractEntity extends extractCreateEntity {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}