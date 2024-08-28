import { Transform } from "class-transformer";
import { IsISO8601, IsNumber } from "class-validator";
import { IsObjectId } from "../../common/decorator/object-id.decorator";

export class ProofPaymentDto {
    @IsObjectId()
    customerId: string;

    @IsNumber()
    totalValue: number;

    @IsNumber()
    dailyValue: number;

    @IsNumber()
    days: number;

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