import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Actor } from 'src/enums/actor.enum';

export class RegistrationMailInput {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  destination: string;

  @IsNotEmpty()
  authId: string;

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  registrationType: Actor;
}
