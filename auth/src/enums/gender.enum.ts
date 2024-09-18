import { registerEnumType } from '@nestjs/graphql';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHERS = 'OTHERS',
}
registerEnumType(Gender, { name: 'Gender' });