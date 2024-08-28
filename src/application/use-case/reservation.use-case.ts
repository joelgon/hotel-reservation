import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { Big } from 'big.js'
import { IReservationRepository, IReservationRequest } from "../../domain/repositories/reservation.repository";
import { IRoomRepository } from "../../domain/repositories/room.repository";
import { ISendMessaging } from "../../domain/messaging";
import { Transaction } from "../../common/decorator/transaction.decorator";
import { ClientSession } from "mongoose";
import { IReservationMessaging } from "../../domain/messaging/reservation.messaging";
import { CREATE_RESERVATION } from "../../common/constant/messaging.constant";
import { ILockItemRepository } from "../../domain/repositories/lock-item.repository";
import { ICustomerBalanceRepository } from "../../domain/repositories/customer-balance.repository";
import { IExtractRepository } from "../../domain/repositories/extract.repository";
import { customerBalanceEntity } from "../../domain/entities/customer-balance.entity";
import dayjs = require("dayjs");

export class ReservationUseCase {
    private readonly logger: Logger;
    private readonly reservationRepository: IReservationRepository;
    private readonly roomRepository: IRoomRepository;
    private readonly lockItemRepository: ILockItemRepository;
    private readonly customerBalanceRepository: ICustomerBalanceRepository;
    private readonly extractRepository: IExtractRepository;
    private readonly sendMessaging: ISendMessaging;

    constructor(
        logger: Logger,
        reservationRepository: IReservationRepository,
        roomRepository: IRoomRepository,
        lockItemRepository: ILockItemRepository,
        customerBalanceRepository: ICustomerBalanceRepository,
        extractRepository: IExtractRepository,
        sendMessaging: ISendMessaging
    ) {
        this.logger = logger;
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.lockItemRepository = lockItemRepository;
        this.sendMessaging = sendMessaging;
        this.customerBalanceRepository = customerBalanceRepository;
        this.extractRepository = extractRepository;
    }

    @Transaction()
    async execute(oldCustomerBalance: customerBalanceEntity, reservationRequest: IReservationRequest, session?: ClientSession) {
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