import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    password!: string;
}