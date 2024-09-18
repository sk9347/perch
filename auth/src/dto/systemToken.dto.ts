import { IsNotEmpty } from 'class-validator';

export class SystemTokenInput {
  @IsNotEmpty()
  secret: string;

  @IsNotEmpty()
  authId: string;
}
