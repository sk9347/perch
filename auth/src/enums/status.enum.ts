import { registerEnumType } from '@nestjs/graphql';

export enum Status {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

registerEnumType(Status, { name: 'Status' });
