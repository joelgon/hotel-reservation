import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { logger } from '../../infra/logger';
import { httpMiddleware } from '../../application/middleware/http.middleware';
import { HotelModel } from '../../infra/database/model/hotel.model';


async function seedHotel(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  logger.info({}, 'start seed hotel');

  const hotels = [
    { _id: "64eaff000000000000000001", name: "Hotel Pequeno", rooms: 2, dailyValue: 300 },
    { _id: "64eaff000000000000000002", name: "Hotel Grande", rooms: 45, dailyValue: 250 },
    { _id: "64eaff000000000000000003", name: "Hotel Médio", rooms: 30, dailyValue: 200 },
    { _id: "64eaff000000000000000004", name: "Hotel Confortável", rooms: 25, dailyValue: 220 },
    { _id: "64eaff000000000000000005", name: "Hotel Econômico", rooms: 20, dailyValue: 150 },
    { _id: "64eaff000000000000000006", name: "Hotel de Luxo", rooms: 50, dailyValue: 300 },
    { _id: "64eaff000000000000000007", name: "Hotel Simples", rooms: 18, dailyValue: 180 },
    { _id: "64eaff000000000000000008", name: "Hotel Boutique", rooms: 15, dailyValue: 280 },
    { _id: "64eaff000000000000000009", name: "Hotel Moderno", rooms: 40, dailyValue: 240 },
    { _id: "64eaff000000000000000010", name: "Hotel Tradicional", rooms: 35, dailyValue: 270 },
  ];

  await HotelModel.insertMany(hotels);

  logger.info({}, 'end seed hotel');

  return {
    statusCode: 200,
    body: ''
  };
};

export const handler = httpMiddleware(seedHotel)