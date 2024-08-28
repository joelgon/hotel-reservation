import { Hotel, HotelModel } from '../model/hotel.model';

export class HotelRepository {
  async findById(id: string): Promise<Hotel | undefined> {
    const hotel = await HotelModel.findById(id).exec();
    if (!hotel) return undefined;

    return hotel.toObject();
  }
}
