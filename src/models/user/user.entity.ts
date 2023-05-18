import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';

import { BaseEntity } from '@models/base.entity';

/**
 * Typeorm entity for User.
 */
@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  lastLoginAt: Date;
}
