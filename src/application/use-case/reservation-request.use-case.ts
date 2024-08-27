import { Logger } from "pino";
import { PreconditionFailed } from 'http-errors';
import { IReservationRepository, IReservationRequest } from "../../domain/repositories/reservation.repository";
import { customerEntity } from "../../domain/entities/customer.entity";
import { IRoomRepository } from "../../domain/repositories/room.repository";
import { ISendMessaging } from "../../domain/messaging";
import { Transaction } from "../../common/decorator/transaction.decorator";
import { ClientSession } from "mongoose";
import { IReservationMessaging } from "../../domain/messaging/reservation.messaging";
import { CREATE_RESERVATION } from "../../common/constant/messaging.constant";

export class ReservationRequestUseCase {
    private readonly logger: Logger;
    private readonly reservationRepository: IReservationRepository;
    private readonly roomRepository: IRoomRepository;
    private readonly sendMessaging: ISendMessaging;

    constructor(logger: Logger, reservationRepository: IReservationRepository, roomRepository: IRoomRepository, sendMessaging: ISendMessaging) {
        this.logger = logger;
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.sendMessaging = sendMessaging;
    }

    @Transaction()
    async execute({ _id }: customerEntity, reservationRequest: IReservationRequest, session?: ClientSession) {
        const conflictRoomIds = await this.reservationRepository.conflictReservations(reservationRequest);

        const room = await this.roomRepository.findFreeRomm({ hotelId: reservationRequest.hotelId, _ids: conflictRoomIds });
        if (!room) throw new PreconditionFailed('The hotel does not have rooms available for these dates');

        const reservation = await this.reservationRepository.create({
            customerId: _id.toString(),
            roomId: room._id.toString(),
            status: 'processing',
            ...reservationRequest,
        }, session);

        const isSuccess = this.sendMessaging.execute<IReservationMessaging>({
            queueName: CREATE_RESERVATION,
            deduplicationId: reservation._id.toString(),
            groupId: room.hotelId,
            body: {
                reservationId: reservation._id.toString(),
                customerId: _id.toString(),
                ...reservationRequest
            }
        });

        if (!isSuccess) throw new PreconditionFailed('Failed to send message');

        return reservation;
    }
}