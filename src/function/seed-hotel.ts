import { APIGatewayProxyResult } from 'aws-lambda';

import { noAuthMiddleware } from '../middleware/no-auth.middleware';
import { HotelModel } from '../model/hotel.model';
import { Room, RoomModel } from '../model/room.model';
import { logger } from '../common/utils/logger.util';

async function seedHotel(): Promise<APIGatewayProxyResult> {
  logger.info({}, 'start seed hotel');

  const hotels = [
    { _id: '64eaff000000000000000001', name: 'Hotel Pequeno', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000002', name: 'Hotel Grande', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000003', name: 'Hotel Médio', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000004', name: 'Hotel Confortável', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000005', name: 'Hotel Econômico', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000006', name: 'Hotel de Luxo', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000007', name: 'Hotel Simples', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000008', name: 'Hotel Boutique', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000009', name: 'Hotel Moderno', dailyValue: Math.floor(Math.random() * 250) + 50 },
    { _id: '64eaff000000000000000010', name: 'Hotel Tradicional', dailyValue: Math.floor(Math.random() * 250) + 50 },
  ];

  await HotelModel.insertMany(hotels);

  const roomPromises = hotels.map((hotel, index) => {
    const totalRooms = index === 0 ? 2 : Math.floor(Math.random() * 19) + 2;
    const rooms: Omit<Room, '_id'>[] = [];

    for (let i = 1; i <= totalRooms; i++) {
      rooms.push({
        hotelId: hotel._id.toString(),
        roomNumber: i,
      });
    }

    return RoomModel.insertMany(rooms);
  });

  await Promise.all(roomPromises);

  logger.info({}, 'end seed hotel');

  return {
    statusCode: 200,
    body: '',
  };
}

export const handler = noAuthMiddleware(seedHotel);
