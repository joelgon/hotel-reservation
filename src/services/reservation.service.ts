import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { Big } from 'big.js'
import { ClientSession } from "mongoose";
import * as dayjs from 'dayjs';
import { ReservationRepository } from "../repositories/reservation.repository";
import { RoomRepository } from "../repositories/room.repository";
import { LockItemRepository } from "../repositories/lock-item.repository";
import { CustomerBalanceRepository } from "../repositories/customer-balance.repository";
import { ExtractRepository } from "../repositories/extract.repository";
import { SendMessagingProvider } from "../providers/send-messaging.provider";
import { logger } from "../utils/logger.util";
import { Transaction } from "../common/decorator/transaction.decorator";
import { CustomerBalance } from "../model/customer-balance.model";
import { ReservationDto } from "../dtos/reservation.dto";

export class ReservationService {
    private readonly logger: Logger;
    private readonly reservationRepository: ReservationRepository;
    private readonly roomRepository: RoomRepository;
    private readonly lockItemRepository: LockItemRepository;
    private readonly customerBalanceRepository: CustomerBalanceRepository;
    private readonly extractRepository: ExtractRepository;
    private readonly sendMessagingProvider: SendMessagingProvider;

    constructor() {
        this.logger = logger;
        this.reservationRepository = new ReservationRepository();
        this.roomRepository = new RoomRepository();
        this.lockItemRepository = new LockItemRepository();
        this.customerBalanceRepository = new CustomerBalanceRepository();
        this.extractRepository = new ExtractRepository();
        this.sendMessagingProvider = new SendMessagingProvider();
    }

    @Transaction()
    async execute(oldCustomerBalance: CustomerBalance, reservationRequest: ReservationDto, session?: ClientSession) {
        try {
            await Promise.all([
                this.lockItemRepository.create(reservationRequest.hotelId),
                this.lockItemRepository.create(oldCustomerBalance._id.toString())
            ]);

            const conflictRoomIds = await this.reservationRepository.conflictReservations(reservationRequest);

            const [customerBalance, room] = await Promise.all([
                this.customerBalanceRepository.findOne(oldCustomerBalance.customerId.toString()),
                this.roomRepository.findFreeRomm({ hotelId: reservationRequest.hotelId, _ids: conflictRoomIds }),
            ])

            if (!customerBalance) throw new PreconditionFailed('customer balance not found');
            if (!room) throw new PreconditionFailed('The hotel does not have rooms available for these dates');

            const diffDays = dayjs(reservationRequest.checkOut).diff(reservationRequest.checkIn, 'days');
            const balance = new Big(customerBalance.value);
            const dailyValue = new Big(room.dailyValue);
            const totalDailys = dailyValue.times(diffDays);

            this.logger.info({ diffDays, balance: customerBalance.value, dailyValue: room.dailyValue, totalDailys }, 'procure isso akiiiiiiiiiiiiii')

            if (balance.lt(totalDailys)) throw new PreconditionFailed('Insufficient balance');

            const updateBalance = balance.sub(totalDailys).toNumber();

            const [reservation, , succesUpdate] = await Promise.all([
                this.reservationRepository.create({
                    customerId: customerBalance.customerId.toString(),
                    roomId: room._id.toString(),
                    ...reservationRequest,
                }, session),

                this.extractRepository.create({ customerId: customerBalance.customerId?.toString(), description: 'Reserva realizada', value: totalDailys.toNumber() }, session),

                this.customerBalanceRepository.update({ customerId: customerBalance.customerId?.toString(), value: updateBalance }, session)
            ]);

            if (!succesUpdate) throw new PreconditionFailed(`CustomerBalance not found`);

            return reservation;
        } catch (error) {
            throw error;
        } finally {
            await Promise.all([
                this.lockItemRepository.delete(reservationRequest.hotelId),
                this.lockItemRepository.delete(oldCustomerBalance._id.toString()),
            ]);
        }

        // const isSuccess = this.sendMessaging.execute<IReservationMessaging>({
        //     queueName: CREATE_RESERVATION,
        //     deduplicationId: reservation._id.toString(),
        //     groupId: room.hotelId,
        //     body: {
        //         reservationId: reservation._id.toString(),
        //         customerId: _id.toString(),
        //         ...reservationRequest
        //     }
        // });

        // if (!isSuccess) throw new PreconditionFailed('Failed to send message');
    }
}