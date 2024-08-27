import { roomEntity } from "../entities/room.entity";

export interface IRoomRepository {
    findFreeRomm({ hotelId, _ids }: { hotelId: string; _ids: string[] }): Promise<roomEntity | undefined>;
}