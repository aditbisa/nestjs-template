import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';

import { UserRole } from '@schemas';
import { BaseEntity } from '@models/base.entity';

/**
 * Typeorm entity for User.
 */
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  lastLoginAt: Date;

  @Column()
  role: UserRole;
}
