import { Big } from 'big.js';
import dayjs from 'dayjs';
import { PreconditionFailed } from 'http-errors';
import { ClientSession } from 'mongoose';
import { Logger } from 'pino';

import { GENERATE_PROOF_QUEUE_NAME } from '../common/constant/messaging.constant';
import { Transaction } from '../common/decorator/transaction.decorator';
import { ProofPaymentDto } from '../dtos/proof-payment.dto';
import { ReservationDto } from '../dtos/reservation.dto';
import { CustomerBalance } from '../model/customer-balance.model';
import { SendMessagingProvider } from '../providers/send-messaging.provider';
import { CustomerBalanceRepository } from '../repositories/customer-balance.repository';
import { ExtractRepository } from '../repositories/extract.repository';
import { HotelRepository } from '../repositories/hotel.repository';
import { LockItemRepository } from '../repositories/lock-item.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { RoomRepository } from '../repositories/room.repository';
import { logger } from '../utils/logger.util';

export class ReservationService {
  private readonly logger: Logger;
  private readonly reservationRepository: ReservationRepository;
  private readonly roomRepository: RoomRepository;
  private readonly lockItemRepository: LockItemRepository;
  private readonly customerBalanceRepository: CustomerBalanceRepository;
  private readonly extractRepository: ExtractRepository;
  private readonly sendMessagingProvider: SendMessagingProvider;
  private readonly hotelRepository: HotelRepository;

  constructor() {
    this.logger = logger;
    this.reservationRepository = new ReservationRepository();
    this.roomRepository = new RoomRepository();
    this.lockItemRepository = new LockItemRepository();
    this.customerBalanceRepository = new CustomerBalanceRepository();
    this.extractRepository = new ExtractRepository();
    this.sendMessagingProvider = new SendMessagingProvider();
    this.hotelRepository = new HotelRepository();
  }

  @Transaction()
  async execute(oldCustomerBalance: CustomerBalance, reservationDto: ReservationDto, session?: ClientSession) {
    try {
      this.logger.info({ reservationDto }, 'Start reservation');

      await Promise.all([this.lockItemRepository.create(reservationDto.hotelId), this.lockItemRepository.create(oldCustomerBalance._id.toString())]);

      const conflictRoomIds = await this.reservationRepository.conflictReservations(reservationDto);

      const [customerBalance, room, hotel] = await Promise.all([
        this.customerBalanceRepository.findOne(oldCustomerBalance.customerId.toString()),
        this.roomRepository.findFreeRomm({ hotelId: reservationDto.hotelId, _ids: conflictRoomIds }),
        this.hotelRepository.findById(reservationDto.hotelId),
      ]);

      if (!customerBalance) throw new PreconditionFailed('customer balance not found');
      if (!hotel) throw new PreconditionFailed('hotel not found');
      if (!room) throw new PreconditionFailed('The hotel does not have rooms available for these dates');

      const diffDays = dayjs(reservationDto.checkOut).diff(reservationDto.checkIn, 'days');
      const balance = new Big(customerBalance.value);
      const dailyValue = new Big(hotel.dailyValue);
      const totalValue = dailyValue.times(diffDays);

      if (balance.lt(totalValue)) throw new PreconditionFailed('Insufficient balance');

      const updateBalance = balance.sub(totalValue).toNumber();

      const reservation = await this.reservationRepository.create(
        {
          customerId: customerBalance.customerId.toString(),
          roomId: room._id.toString(),
          ...reservationDto,
        },
        session
      );

      await this.extractRepository.create(
        { customerId: customerBalance.customerId?.toString(), description: 'Reserva realizada', value: totalValue.toNumber() },
        session
      );

      const succesUpdate = await this.customerBalanceRepository.update(
        { customerId: customerBalance.customerId?.toString(), value: updateBalance },
        session
      );

      if (!succesUpdate) throw new PreconditionFailed(`CustomerBalance not found`);

      const isSuccess = this.sendMessagingProvider.execute<ProofPaymentDto>({
        queueName: GENERATE_PROOF_QUEUE_NAME,
        deduplicationId: reservation._id.toString(),
        groupId: room.hotelId,
        body: {
          customerId: customerBalance.customerId.toString(),
          reservationId: reservation._id.toString(),
          totalValue: totalValue.toNumber(),
          dailyValue: dailyValue.toNumber(),
          days: diffDays,
          checkIn: reservationDto.checkIn,
          checkOut: reservationDto.checkOut,
        },
      });

      if (!isSuccess) throw new PreconditionFailed('Failed to send message');

      this.logger.info({}, 'Succes create reservation');

      return reservation;
    } catch (error) {
      this.logger.error({ error }, 'Fail to create reservation');
      throw error;
    } finally {
      await Promise.all([this.lockItemRepository.delete(reservationDto.hotelId), this.lockItemRepository.delete(oldCustomerBalance._id.toString())]);
    }
  }
}
