import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Config registration.
 */
export const MariadbConfig = registerAs('mariadb', () => ({
  host: process.env.MARIADB_HOST,
  port: process.env.MARIADB_PORT,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
}));

/**
 * Config validation schema.
 */
export const MariadbConfigSchema = Joi.object({
  MARIADB_HOST: Joi.string().default('127.0.0.1'),
  MARIADB_PORT: Joi.number().default(3306),
  MARIADB_USER: Joi.string().default('mariadb'),
  MARIADB_PASSWORD: Joi.string().default(''),
  MARIADB_DATABASE: Joi.string().default('mariadb'),
});
