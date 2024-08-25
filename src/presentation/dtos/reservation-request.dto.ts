import { Transform } from "class-transformer";
import { IsISO8601, IsString } from "class-validator";

export class RservationRequestDto {
    @IsString()
    name: string;

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