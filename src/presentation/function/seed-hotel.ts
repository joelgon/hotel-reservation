import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { logger } from '../../infra/logger';
import { httpMiddleware } from '../../application/middleware/http.middleware';
import { HotelModel } from '../../infra/database/model/hotel.model';
import { RoomModel } from '../../infra/database/model/room.model';


async function seedHotel(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  logger.info({}, 'start seed hotel');

  const hotels = [
    { _id: "64eaff000000000000000001", name: "Hotel Pequeno", },
    { _id: "64eaff000000000000000002", name: "Hotel Grande", },
    { _id: "64eaff000000000000000003", name: "Hotel Médio", },
    { _id: "64eaff000000000000000004", name: "Hotel Confortável", },
    { _id: "64eaff000000000000000005", name: "Hotel Econômico", },
    { _id: "64eaff000000000000000006", name: "Hotel de Luxo", },
    { _id: "64eaff000000000000000007", name: "Hotel Simples", },
    { _id: "64eaff000000000000000008", name: "Hotel Boutique", },
    { _id: "64eaff000000000000000009", name: "Hotel Moderno", },
    { _id: "64eaff000000000000000010", name: "Hotel Tradicional", },
  ];

  await HotelModel.insertMany(hotels);

  const roomPromises = hotels.map((hotel, index) => {
    const totalRooms = index === 0 ? 2 : Math.floor(Math.random() * 19) + 2;
    const rooms: any[] = [];

    for (let i = 1; i <= totalRooms; i++) {
      rooms.push({
        hotelId: hotel._id.toString(),
        roomNumber: i,
        dailyValue: Math.floor(Math.random() * 250) + 50
      });
    }

    return RoomModel.insertMany(rooms);
  });

  await Promise.all(roomPromises);

  logger.info({}, 'end seed hotel');

  return {
    statusCode: 200,
    body: ''
  };
};

export const handler = httpMiddleware(seedHotel)