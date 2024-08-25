import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class SignUpDto {
    @IsString()
    name: string;

    @IsEmail()
    @Transform(({ value }) => value?.toLocaleUpperCase())
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}