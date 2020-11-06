import { IsNumber, IsString } from "class-validator";

export class CreateUserDTO {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class AuthUserDTO {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class GetUsersDTO {
  @IsNumber()
  perPage!:number

  @IsNumber()
  page!:number
}