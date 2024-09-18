import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';

@InputType()
export class NotifyEmailInput {

  @Field()
  @Transform(({ value }) => value.toLowerCase())
  to: string;

  @Field()
  @Transform(({ value }) => value.toLowerCase())
  from: string;

  @Field()
  subject: string;

  @Field({nullable: true})
  bodyText: string;

  @Field({nullable: true})
  bodyHTML: string;

  @Field()
  isHtml: boolean;
}
