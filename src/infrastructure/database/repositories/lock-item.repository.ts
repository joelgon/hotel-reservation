import { Types } from "mongoose";
import { LockItemModel } from "../model/lock-item.model";

export class LockItemRepository {
    async create(_id: string) {
        const lockItemModel = new LockItemModel({ _id: new Types.ObjectId(_id) });

        try {
            const lockItem = await lockItemModel.save();

            return lockItem.toObject();
        } catch (error) {
            if (error.code === 11000) return undefined;
            throw error;
        }
    }

    async delete(_id: string): Promise<void> {
        await LockItemModel.deleteOne({ _id }).exec()
    }
}
