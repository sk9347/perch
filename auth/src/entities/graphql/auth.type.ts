import { Field, ObjectType } from '@nestjs/graphql';
import { Status } from 'src/enums/status.enum';

@ObjectType()
export class Auth {
  @Field({ nullable: true })
  userId?: string;

  @Field(() => Status)
  status: Status;
}
