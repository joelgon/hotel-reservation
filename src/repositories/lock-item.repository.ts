import { Types } from 'mongoose';

import { LockItem, LockItemModel } from '../model/lock-item.model';
import { logger } from '../utils/logger.util';

export class LockItemRepository {
  async create(_id: string): Promise<LockItem | undefined> {
    const lockItemModel = new LockItemModel({ _id: new Types.ObjectId(_id) });

    try {
      const lockItem = await lockItemModel.save();

      return lockItem.toObject();
    } catch (error) {
      logger.error({ error }, LockItemRepository.name);
      if (error.code === 11000) return undefined;
      throw error;
    }
  }

  async delete(_id: string): Promise<void> {
    await LockItemModel.deleteOne({ _id }).exec();
  }
}
