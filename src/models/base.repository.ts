import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { BaseEntity } from './base.entity';

/**
 * Base repository to perform database operations.
 * All methods in this base repository is geared toward REST API usage.
 * Some methods might not suit in term of performance for certain use case.
 */
@Injectable()
export abstract class BaseRepository<TEntity extends BaseEntity> {
  constructor(protected readonly dataSource: DataSource) {}

  /**
   * Implement getting repository from DataSource.
   *
   * @example return this.dataSource.getRepository(TEntity);
   */
  abstract get repository(): Repository<TEntity>;

  /**
   * Finds first entity by a given criteria.
   *
   * @param criteria - Entity Id or simple condition that should be applied to match entities.
   * @param throwsException - Flag for when data not found. Rather than returning null, throw an exception instead.
   * @param options - More options for finding entity.
   * @returns - First entity found or null.
   */
  async findOne(
    criteria: BaseEntity['id'] | FindOptionsWhere<TEntity>,
    throwsException = false,
    options: FindOneOptions<TEntity> = {},
  ): Promise<TEntity | null> {
    if (typeof criteria != 'object') {
      criteria = { id: criteria } as FindOptionsWhere<TEntity>;
    }
    options.where = criteria as FindOptionsWhere<TEntity>;
    return this.repository
      .findOne(options)
      .then((entity) => {
        if (!entity && throwsException) {
          return Promise.reject(new NotFoundException('Data not found.'));
        }
        return Promise.resolve(entity);
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * Finds last entity by a given criteria.
   *
   * @param criteria - Entity Id or simple condition that should be applied to match entities.
   * @param throwsException - Flag for when data not found. Rather than returning null, throw an exception instead.
   * @param options - More options for finding entity.
   * @returns - Last entity found or null.
   */
  async findLastOne(
    criteria: BaseEntity['id'] | FindOptionsWhere<TEntity>,
    throwsException = false,
    options: FindOneOptions<TEntity> = {},
  ): Promise<TEntity | null> {
    // @ts-expect-error Cannot satisfy type definition even using valid code.
    options.order = { id: 'DESC' };
    return this.findOne(criteria, throwsException, options);
  }

  /**
   * Finds entities by a given criteria.
   *
   * @param criteria - Simple condition that should be applied to match entities.
   * @param options - More options for finding entities.
   * @returns - All entities found or an empty array.
   */
  async findMany(
    criteria: FindOptionsWhere<TEntity>,
    options: FindManyOptions<TEntity> = {},
  ): Promise<TEntity[]> {
    if (!options.order) {
      // @ts-expect-error Cannot satisfy type definition even using valid code.
      options.order = { id: 'DESC' };
    }
    options.where = criteria;
    return this.repository
      .find(options)
      .catch((error) => Promise.reject(error));
  }

  /**
   * Create and save single entity.
   *
   * @param inputs - Data to save.
   * @returns - A newly saved entity.
   */
  async create(
    inputs: DeepPartial<TEntity>, // TS error when using QueryDeepPartialEntity<TEntity>.
  ): Promise<TEntity> {
    return this.repository
      .insert(inputs as QueryDeepPartialEntity<TEntity>)
      .then((result) => this.findOne(result.identifiers[0]['id']))
      .catch((error) => Promise.reject(error));
  }

  /**
   * Update and load entity with its relations from database.
   *
   * @param entityId - Entity Id.
   * @param inputs - Data for update.
   * @param options - More options for loading the entity.
   * @returns - An updated entity.
   */
  async update(
    entityId: BaseEntity['id'],
    inputs: DeepPartial<TEntity>, // TS error when using QueryDeepPartialEntity<TEntity>.
    options: FindOneOptions<TEntity> = {},
  ): Promise<TEntity> {
    return this.repository
      .update(entityId, inputs as QueryDeepPartialEntity<TEntity>)
      .then(() => this.findOne(entityId, true, options))
      .catch((error) => Promise.reject(error));
  }

  /**
   * Delete entity from database.
   *
   * @param entityId - Entity Id.
   */
  async delete(entityId: BaseEntity['id']): Promise<DeleteResult> {
    return this.repository.delete(entityId);
  }

  /**
   * Soft delete entity from database.
   *
   * @param entityId - Entity Id.
   */
  async softDelete(entityId: BaseEntity['id']): Promise<UpdateResult> {
    return this.repository.softDelete(entityId);
  }
}
