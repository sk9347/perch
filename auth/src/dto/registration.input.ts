import { Field, InputType } from '@nestjs/graphql';
import {  IsEnum, IsOptional } from 'class-validator';

import { Actor } from 'src/enums/actor.enum';

@InputType()
export class RegistrationInput {

  @Field()
  authId: string;

  @Field(()=> Actor)
  @IsEnum(Actor)
  registrationType: Actor;

  @Field()
  request: string;

  @Field({nullable: true})
  @IsOptional()
  organisationId?: string;

}
