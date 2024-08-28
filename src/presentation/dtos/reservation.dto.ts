import { Transform } from "class-transformer";
import { IsObjectId } from "../../common/decorator/object-id.decorator";
import { IsISO8601 } from "class-validator";

export class ReservationDto {
    @IsObjectId()
    hotelId: string;

    @IsObjectId()
    customerId: string;

    @IsObjectId()
    reservationId: string;

    @Transform(({ value }) => {
        const [day] = value.split(/T/);
        return `${day}T00:00:00Z`
    })
    @IsISO8601({ strict: true })
    checkIn: Date;

    @Transform(({ value }) => {
        const [day] = value.split(/T/);
        return `${day}T00:00:00Z`
    })
    @IsISO8601({ strict: true })
    checkOut: Date;
}