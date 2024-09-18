import { IsEnum } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { Status } from 'src/enums/status.enum';
import { Actor } from 'src/enums/actor.enum';

@Entity({ name: 'auth' })
export class AuthEntity {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  authId: string = uuidV4();

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: Status, default: Status.INACTIVE })
  @IsEnum(Status)
  status: Status = Status.INACTIVE;

  @Column({ type: 'enum', enum: Actor, default: Actor.USER })
  @IsEnum(Actor)
  actorType: Actor = Actor.USER;

  @Column()
  refreshToken: string;

  @Column()
  organisationId: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
