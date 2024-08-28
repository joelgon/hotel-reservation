import { Room, RoomModel } from "../model/room.model";

export class RoomRepository {
    async findFreeRomm({ hotelId, _ids }): Promise<Room | undefined> {
        const room = await RoomModel.findOne({ hotelId, _id: { $nin: _ids } });
        if (!room) return undefined;

        return room.toObject();
    }
}