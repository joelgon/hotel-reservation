import { Types } from "mongoose"

export interface roomEntity {
    _id: Types.ObjectId;
    hotelId: string,
    roomNumber: number;
    dailyValue: number;
}