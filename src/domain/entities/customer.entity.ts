import { Types } from "mongoose";

export interface customerCreateEntity {
    name: string;
    email: string;
    password: string
}

export interface customerEntity extends customerCreateEntity {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
