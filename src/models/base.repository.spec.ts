import { Injectable, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exclude } from 'class-transformer';
import { Column, Entity, EntityManager, Like, Not } from 'typeorm';

import { BaseEntity } from './base.entity';
import { BaseRepository } from './base.repository';

/**
 * Test entity.
 */
@Entity()
class TestEntity extends BaseEntity {
  @Column('json')
  data: unknown;

  @Column({ default: true })
  flag: boolean;

  // `@Column({ select: false })` still a huge pain. Ref: https://github.com/typeorm/typeorm/issues/5816
  @Column()
  @Exclude()
  secret: string;
}

/**
 * Test repository.
 */
@Injectable()
class TestRepository extends BaseRepository<TestEntity> {
  get repository() {
    return this.dataSource.getRepository(TestEntity);
  }
}

describe('BaseRepository', () => {
  let module: TestingModule;
  let testRepository: TestRepository;
  let manager: EntityManager;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [TestEntity],
        }),
      ],
      providers: [TestRepository],
    }).compile();

    manager = module.get<EntityManager>(EntityManager);
    testRepository = module.get<TestRepository>(TestRepository);
  });

  afterEach(async () => {
    await testRepository.repository.clear();
  });

  it('should create new data', async () => {
    const inputs = {
      data: { state: 1 },
      secret: 'secret',
    };

    const entity = await testRepository.create(inputs);
    expect(entity.id).toBe(1);
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.deleteAt).toBeNull();
    expect(entity.data).toEqual(inputs.data);
    expect(entity.flag).toBe(true);
    expect(entity.secret).toBe(inputs.secret);

    const obj = JSON.parse(JSON.stringify(entity));
    expect(obj['secret']).toBeUndefined();

    const check = await manager.findOneBy<TestEntity>(TestEntity, {
      id: entity.id,
    });
    expect(check.id).toBe(1);
    expect(check.createdAt).toEqual(entity.createdAt);
    expect(check.updatedAt).toEqual(entity.updatedAt);
    expect(check.deleteAt).toBeNull();
    expect(check.data).toEqual(entity.data);
    expect(check.flag).toBe(entity.flag);
    expect(check.secret).toBe(entity.secret);
  });

  it('should get data by id', async () => {
    const inputs = {
      data: { state: 1 },
      secret: 'secret',
    };
    const created = await manager.save(TestEntity, inputs);

    const entity = await testRepository.findOne(created.id);
    expect(entity.createdAt).toEqual(created.createdAt);
    expect(entity.updatedAt).toEqual(created.updatedAt);
    expect(entity.data).toEqual(created.data);
  });

  it('should get first data', async () => {
    await manager.save(TestEntity, { data: 'data', secret: 'secret-1' });
    await manager.save(TestEntity, { data: 'data', secret: 'secret-2' });

    const entity = await testRepository.findOne({ data: '"data"' });
    expect(entity.secret).toEqual('secret-1');
  });

  it('should get latest data', async () => {
    await manager.save(TestEntity, { data: 'data', secret: 'secret-1' });
    await manager.save(TestEntity, { data: 'data', secret: 'secret-2' });

    const entity = await testRepository.findLastOne({ data: '"data"' });
    expect(entity.secret).toEqual('secret-2');
  });

  it('should return null for non-existent id', async () => {
    const entity = await testRepository.findOne(999);
    expect(entity).toBeNull();
  });

  it('should throw exception for non-existent id', async () => {
    let error;
    try {
      await testRepository.findOne(999, true);
    } catch (err) {
      error = err;
    }
    expect(error).toBeTruthy();
    expect(error).toBeInstanceOf(NotFoundException);
  });

  it('should get all data', async () => {
    await manager.save(TestEntity, { data: 'data1', secret: 'secret-1' });
    await manager.save(TestEntity, { data: 'data2', secret: 'secret-2' });

    const entities = await testRepository.findMany({});
    expect(entities.length).toBe(2);
    expect(entities[0].data).toBe('data2');
    expect(entities[1].data).toBe('data1');
  });

  it('should find all data with simple condition', async () => {
    /**
     * Demonstrate the findMany method with the SQL LIKE operator.
     */
    await manager.save(TestEntity, { data: 'data1', secret: 'secret-1' });
    await manager.save(TestEntity, { data: 'data2', secret: 'secret-2' });
    await manager.save(TestEntity, { data: 'fail', secret: 'no-secret' });

    const entities = await testRepository.findMany({
      secret: Like('secret-%'),
    });
    expect(entities.length).toBe(2);
    expect(entities[0].data).toBe('data2');
    expect(entities[1].data).toBe('data1');
  });

  it('should find paginated data with simple condition', async () => {
    /**
     * Demonstrate the findMany method with the SQL LIKE operator.
     */
    for (let i = 1; i <= 5; i++) {
      await manager.save(TestEntity, { data: `d${i}`, secret: 's${i}' });
    }
    await manager.save(TestEntity, { data: 'skipped', secret: '' });
    for (let i = 6; i <= 10; i++) {
      await manager.save(TestEntity, { data: `d${i}`, secret: 's${i}' });
    }

    const ls1 = await testRepository.findPaginated(1, 2, { secret: Not('') });
    expect(ls1.data.length).toBe(2);
    expect(ls1.data[0].data).toBe('d10');
    expect(ls1.data[1].data).toBe('d9');
    expect(ls1.page).toBe(1);
    expect(ls1.count).toBe(2);
    expect(ls1.countPerPage).toBe(2);
    expect(ls1.totalPage).toBe(5);
    expect(ls1.totalCount).toBe(10);

    const ls2 = await testRepository.findPaginated(3, 4, { secret: Not('') });
    expect(ls2.data.length).toBe(2);
    expect(ls2.data[0].data).toBe('d2');
    expect(ls2.data[1].data).toBe('d1');
    expect(ls2.page).toBe(3);
    expect(ls2.count).toBe(2);
    expect(ls2.countPerPage).toBe(4);
    expect(ls2.totalPage).toBe(3);
    expect(ls2.totalCount).toBe(10);
  });

  it('should update the data', async () => {
    const created = await manager.save(TestEntity, {
      data: { state: 1 },
      secret: 'secret',
    });

    const entity = await testRepository.update(created.id, {
      data: 'updated',
    });
    expect(entity.data).toBe('updated');

    const check = await manager.findOneBy<TestEntity>(TestEntity, {
      id: created.id,
    });
    expect(check.data).toBe('updated');
  });

  it('should delete the data', async () => {
    const created = await manager.save(TestEntity, {
      data: { state: 1 },
      secret: 'secret',
    });

    const result = await testRepository.delete(created.id);
    expect(result.affected).toBe(1);

    const checkSoft = await manager.findOneBy<TestEntity>(TestEntity, {
      id: created.id,
    });
    expect(checkSoft).toBeFalsy();

    const checkHard = await manager.findOne<TestEntity>(TestEntity, {
      where: { id: created.id },
      withDeleted: true,
    });
    expect(checkHard).toBeFalsy();
  });

  it('should soft-delete the data', async () => {
    const created = await manager.save(TestEntity, {
      data: { state: 2 },
      secret: 'secret',
    });

    const result = await testRepository.softDelete(created.id);
    expect(result.affected).toBe(1);

    const checkSoft = await manager.findOneBy<TestEntity>(TestEntity, {
      id: created.id,
    });
    expect(checkSoft).toBeFalsy();

    const checkHard = await manager.findOne<TestEntity>(TestEntity, {
      where: { id: created.id },
      withDeleted: true,
    });
    expect(checkHard).toBeTruthy();
    expect(checkHard.deleteAt).not.toBeNull();
    expect(checkHard.data).toEqual({ state: 2 });
  });
});
