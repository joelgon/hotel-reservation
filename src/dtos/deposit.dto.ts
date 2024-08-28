import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class DepositDto {
    @IsNumber()
    @Transform(({ value }) => Number(value?.toString()?.split('.')?.map((value, index) => {
        if (index == 0) return value;
        else return value.slice(0, 2)
    })
        .join('.')))
    value: number;
}
