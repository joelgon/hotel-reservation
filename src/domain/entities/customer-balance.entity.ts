import { Types } from "mongoose";

export interface customerBalanceCreateEntity {
    customerId: string;
    value: number;
}

export interface customerBalanceEntity extends customerBalanceCreateEntity {
    _id: Types.ObjectId;
}