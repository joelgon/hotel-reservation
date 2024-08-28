import { PreconditionFailed } from 'http-errors';
import { ClientSession } from 'mongoose';

import { ReservationService } from './reservation.service';
import { GENERATE_PROOF_QUEUE_NAME } from '../common/constant/messaging.constant';
import { logger } from '../common/utils/logger.util';
import { SendMessagingProvider } from '../providers/send-messaging.provider';
import { CustomerBalanceRepository } from '../repositories/customer-balance.repository';
import { ExtractRepository } from '../repositories/extract.repository';
import { HotelRepository } from '../repositories/hotel.repository';
import { LockItemRepository } from '../repositories/lock-item.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { RoomRepository } from '../repositories/room.repository';

jest.mock('../repositories/customer-balance.repository');
jest.mock('../repositories/extract.repository');
jest.mock('../repositories/lock-item.repository');
jest.mock('../repositories/reservation.repository');
jest.mock('../repositories/room.repository');
jest.mock('../repositories/hotel.repository');
jest.mock('../providers/send-messaging.provider');
jest.mock('../common/utils/logger.util');
jest.mock('../common/decorator/transaction.decorator', () => ({
  Transaction:
    () =>
    (...args: [unknown, unknown, PropertyDescriptor]) => {
      return args[2];
    },
}));

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let customerBalanceRepository: jest.Mocked<CustomerBalanceRepository>;
  let extractRepository: jest.Mocked<ExtractRepository>;
  let lockItemRepository: jest.Mocked<LockItemRepository>;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let roomRepository: jest.Mocked<RoomRepository>;
  let hotelRepository: jest.Mocked<HotelRepository>;
  let sendMessagingProvider: jest.Mocked<SendMessagingProvider>;

  beforeEach(() => {
    reservationService = new ReservationService();
    customerBalanceRepository = CustomerBalanceRepository.prototype as jest.Mocked<CustomerBalanceRepository>;
    extractRepository = ExtractRepository.prototype as jest.Mocked<ExtractRepository>;
    lockItemRepository = LockItemRepository.prototype as jest.Mocked<LockItemRepository>;
    reservationRepository = ReservationRepository.prototype as jest.Mocked<ReservationRepository>;
    roomRepository = RoomRepository.prototype as jest.Mocked<RoomRepository>;
    hotelRepository = HotelRepository.prototype as jest.Mocked<HotelRepository>;
    sendMessagingProvider = SendMessagingProvider.prototype as jest.Mocked<SendMessagingProvider>;
  });

  it('should create a reservation successfully', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 2000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 2000 });
    roomRepository.findFreeRomm.mockResolvedValue(<any>{ _id: 'room123', hotelId: 'hotel123' });
    hotelRepository.findById.mockResolvedValue(<any>{ _id: 'hotel123', dailyValue: 500 });
    reservationRepository.conflictReservations.mockResolvedValue([]);
    reservationRepository.create.mockResolvedValue(<any>{ _id: 'reservation123', customerId: '123', roomId: 'room123' });
    extractRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.update.mockResolvedValue(true);
    sendMessagingProvider.execute.mockResolvedValue(true);

    const result = await reservationService.execute(oldCustomerBalance, <any>reservationDto, session);

    expect(lockItemRepository.create).toHaveBeenCalledWith('hotel123');
    expect(lockItemRepository.create).toHaveBeenCalledWith('1');
    expect(customerBalanceRepository.findOne).toHaveBeenCalledWith('123');
    expect(roomRepository.findFreeRomm).toHaveBeenCalledWith({ hotelId: 'hotel123', _ids: [] });
    expect(hotelRepository.findById).toHaveBeenCalledWith('hotel123');
    expect(reservationRepository.create).toHaveBeenCalledWith(
      {
        customerId: '123',
        roomId: 'room123',
        ...reservationDto,
      },
      session
    );
    expect(extractRepository.create).toHaveBeenCalledWith({ customerId: '123', description: 'Reserva realizada', value: 2000 }, session);
    expect(customerBalanceRepository.update).toHaveBeenCalledWith({ customerId: '123', value: 0 }, session);
    expect(sendMessagingProvider.execute).toHaveBeenCalledWith({
      queueName: GENERATE_PROOF_QUEUE_NAME,
      deduplicationId: 'reservation123',
      groupId: 'hotel123',
      body: {
        customerId: '123',
        reservationId: 'reservation123',
        totalValue: 2000,
        dailyValue: 500,
        days: 4,
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
      },
    });
    expect(result).toEqual({ _id: 'reservation123', customerId: '123', roomId: 'room123' });
  });

  it('should throw PreconditionFailed if customer balance is not found', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 2000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>null);

    await expect(reservationService.execute(oldCustomerBalance, <any>reservationDto, session)).rejects.toThrow(PreconditionFailed);

    expect(customerBalanceRepository.findOne).toHaveBeenCalledWith('123');
  });

  it('should throw PreconditionFailed if hotel is not found', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 2000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 2000 });
    hotelRepository.findById.mockResolvedValue(<any>null);

    await expect(reservationService.execute(oldCustomerBalance, <any>reservationDto, session)).rejects.toThrow(PreconditionFailed);

    expect(hotelRepository.findById).toHaveBeenCalledWith('hotel123');
  });

  it('should throw PreconditionFailed if no rooms are available', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 2000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 2000 });
    hotelRepository.findById.mockResolvedValue(<any>{ _id: 'hotel123', dailyValue: 500 });
    roomRepository.findFreeRomm.mockResolvedValue(<any>null);

    await expect(reservationService.execute(oldCustomerBalance, <any>reservationDto, session)).rejects.toThrow(PreconditionFailed);

    expect(roomRepository.findFreeRomm).toHaveBeenCalledWith({ hotelId: 'hotel123', _ids: [] });
  });

  it('should throw PreconditionFailed if balance is insufficient', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 1000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 1000 });
    hotelRepository.findById.mockResolvedValue(<any>{ _id: 'hotel123', dailyValue: 500 });
    roomRepository.findFreeRomm.mockResolvedValue(<any>{ _id: 'room123', hotelId: 'hotel123' });

    await expect(reservationService.execute(oldCustomerBalance, <any>reservationDto, session)).rejects.toThrow(PreconditionFailed);

    expect(customerBalanceRepository.findOne).toHaveBeenCalledWith('123');
  });

  it('should log an error and throw if an exception occurs', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 2000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;
    const error = new Error('Test error');

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockRejectedValue(error);

    await expect(reservationService.execute(oldCustomerBalance, <any>reservationDto, session)).rejects.toThrow(error);

    expect(logger.error).toHaveBeenCalledWith({ error }, 'Fail to create reservation');
  });

  it('should fail when trying to update balance', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 2000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 2000 });
    roomRepository.findFreeRomm.mockResolvedValue(<any>{ _id: 'room123', hotelId: 'hotel123' });
    hotelRepository.findById.mockResolvedValue(<any>{ _id: 'hotel123', dailyValue: 500 });
    reservationRepository.conflictReservations.mockResolvedValue([]);
    reservationRepository.create.mockResolvedValue(<any>{ _id: 'reservation123', customerId: '123', roomId: 'room123' });
    extractRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.update.mockResolvedValue(false);

    await expect(reservationService.execute(oldCustomerBalance, <any>reservationDto, session)).rejects.toThrow(PreconditionFailed);

    expect(lockItemRepository.create).toHaveBeenCalledWith('hotel123');
    expect(lockItemRepository.create).toHaveBeenCalledWith('1');
    expect(customerBalanceRepository.findOne).toHaveBeenCalledWith('123');
    expect(roomRepository.findFreeRomm).toHaveBeenCalledWith({ hotelId: 'hotel123', _ids: [] });
    expect(hotelRepository.findById).toHaveBeenCalledWith('hotel123');
    expect(reservationRepository.create).toHaveBeenCalledWith(
      {
        customerId: '123',
        roomId: 'room123',
        ...reservationDto,
      },
      session
    );
    expect(extractRepository.create).toHaveBeenCalledWith({ customerId: '123', description: 'Reserva realizada', value: 2000 }, session);
    expect(customerBalanceRepository.update).toHaveBeenCalledWith({ customerId: '123', value: 0 }, session);
    expect(sendMessagingProvider.execute).not.toHaveBeenCalled();
  });

  it('should fail when trying to send a message', async () => {
    const oldCustomerBalance = { _id: '1', customerId: '123', value: 2000 };
    const reservationDto = {
      hotelId: 'hotel123',
      checkIn: '2024-01-01',
      checkOut: '2024-01-05',
    };
    const session = {} as ClientSession;

    lockItemRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.findOne.mockResolvedValue(<any>{ customerId: '123', value: 2000 });
    roomRepository.findFreeRomm.mockResolvedValue(<any>{ _id: 'room123', hotelId: 'hotel123' });
    hotelRepository.findById.mockResolvedValue(<any>{ _id: 'hotel123', dailyValue: 500 });
    reservationRepository.conflictReservations.mockResolvedValue([]);
    reservationRepository.create.mockResolvedValue(<any>{ _id: 'reservation123', customerId: '123', roomId: 'room123' });
    extractRepository.create.mockResolvedValue(<any>true);
    customerBalanceRepository.update.mockResolvedValue(true);
    sendMessagingProvider.execute.mockResolvedValue(false);

    await expect(reservationService.execute(oldCustomerBalance, <any>reservationDto, session)).rejects.toThrow(PreconditionFailed);

    expect(lockItemRepository.create).toHaveBeenCalledWith('hotel123');
    expect(lockItemRepository.create).toHaveBeenCalledWith('1');
    expect(customerBalanceRepository.findOne).toHaveBeenCalledWith('123');
    expect(roomRepository.findFreeRomm).toHaveBeenCalledWith({ hotelId: 'hotel123', _ids: [] });
    expect(hotelRepository.findById).toHaveBeenCalledWith('hotel123');
    expect(reservationRepository.create).toHaveBeenCalledWith(
      {
        customerId: '123',
        roomId: 'room123',
        ...reservationDto,
      },
      session
    );
    expect(extractRepository.create).toHaveBeenCalledWith({ customerId: '123', description: 'Reserva realizada', value: 2000 }, session);
    expect(customerBalanceRepository.update).toHaveBeenCalledWith({ customerId: '123', value: 0 }, session);
    expect(sendMessagingProvider.execute).toHaveBeenCalledWith({
      queueName: GENERATE_PROOF_QUEUE_NAME,
      deduplicationId: 'reservation123',
      groupId: 'hotel123',
      body: {
        customerId: '123',
        reservationId: 'reservation123',
        totalValue: 2000,
        dailyValue: 500,
        days: 4,
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
      },
    });
  });
});
