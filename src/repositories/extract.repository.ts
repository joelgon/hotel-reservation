import { ClientSession } from 'mongoose';

import { Extract, ExtractModel } from '../model/extract.model';

export class ExtractRepository {
  async create(extract: { customerId: string; description: string; value: number }, session?: ClientSession): Promise<Extract> {
    const extractModel = new ExtractModel(extract);
    return (await extractModel.save({ session })).toObject();
  }
}
