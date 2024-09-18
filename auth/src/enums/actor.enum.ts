import { registerEnumType } from '@nestjs/graphql';

export enum Actor {
    ORGANISATION = 'ORGANISATION',
    USER = 'USER',
}

registerEnumType(Actor, { name: 'Actor' });
