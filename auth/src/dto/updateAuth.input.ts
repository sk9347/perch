import { Field, InputType } from '@nestjs/graphql';
import {  IsEnum } from 'class-validator';

import { Actor } from 'src/enums/actor.enum';

@InputType()
export class UpdateAuthInput {

  @Field()
  authId: string;

  @Field(()=> Actor)
  @IsEnum(Actor)
  registrationType: Actor;

  @Field()
  id: string;

}
