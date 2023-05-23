import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, FindOneOptions } from 'typeorm';
import * as argon2 from 'argon2';

import { BaseRepository } from '@models/base.repository';
import { AppConfigService } from '@configs/app';
import { User } from './user.entity';

/**
 * Session proposal repository.
 */
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    protected readonly dataSource: DataSource,
    private appConfig: AppConfigService,
  ) {
    super(dataSource);
  }

  /**
   * Getting repository from DataSource.
   */
  get repository() {
    return this.dataSource.getRepository(User);
  }

  /**
   * Hash password.
   *
   * @param password - The user password.
   * @returns - Password hash.
   */
  private hashPassword(password: string): Promise<string> {
    const salt = Buffer.from(this.appConfig.salt);
    return argon2.hash(password, { salt });
  }

  /**
   * Verify password.
   *
   * @param hash - The user hashed password.
   * @param password - The user password.
   * @returns - True if match.
   */
  private verifyPassword(hash: string, password: string): Promise<boolean> {
    const salt = Buffer.from(this.appConfig.salt);
    return argon2.verify(hash, password, { salt });
  }

  /**
   * Create user and hash password.
   *
   * @param inputs - Data to save.
   * @returns - A newly saved entity.
   */
  async create(
    inputs: DeepPartial<User>, // TS error when using QueryDeepPartialEntity<TEntity>.
  ): Promise<User> {
    if (inputs.password) {
      inputs.password = await this.hashPassword(inputs.password);
    }
    inputs.lastLoginAt = new Date();
    return super.create(inputs);
  }

  /**
   * Update and load entity from database.
   *
   * @param userId - Entity Id.
   * @param inputs - Data for update.
   * @param options - More options for loading the entity.
   * @returns - An updated entity.
   */
  async update(
    userId: User['id'],
    inputs: DeepPartial<User>, // TS error when using QueryDeepPartialEntity<TEntity>.
    options: FindOneOptions<User> = {},
  ): Promise<User> {
    if (inputs.password) {
      inputs.password = await this.hashPassword(inputs.password);
    }
    return super.update(userId, inputs, options);
  }

  /**
   * Verify user login.
   *
   * @param username
   * @param password
   * @returns - User entity or null.
   */
  async verify(username: string, password: string): Promise<User | false> {
    const user = await this.findOne({ username });

    if (user && (await this.verifyPassword(user.password, password))) {
      const updateData: DeepPartial<User> = { lastLoginAt: new Date() };

      if (argon2.needsRehash(user.password)) {
        updateData.password = await this.hashPassword(password);
      }

      return this.update(user.id, updateData);
    }

    return false;
  }
}
