import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose, instanceToPlain } from 'class-transformer';

/**
 * Default group for serializing.
 */
export const defaultGroupsSerializing = ['timestamps'];

/**
 * Base model for typeorm entities.
 * Every child class name should be in singular noun, e.g. `User`.
 */
@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @Expose({ groups: ['timestamps'] })
  createdAt: Date;

  @UpdateDateColumn()
  @Expose({ groups: ['timestamps'] })
  updatedAt: Date;

  @DeleteDateColumn()
  @Expose({ groups: ['timestamps'] })
  deleteAt: Date;

  /**
   * Json serializer to be used by `JSON.stringify`.
   */
  toJSON() {
    return instanceToPlain(this, { groups: defaultGroupsSerializing });
  }
}
