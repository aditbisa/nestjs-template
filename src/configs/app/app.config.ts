import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Config registration.
 */
export const AppConfig = registerAs('app', () => ({
  env: process.env.APP_ENV,
  name: process.env.APP_NAME,
  description: process.env.APP_DESCRIPTION,
  url: process.env.APP_URL,
  port: process.env.APP_PORT,
}));

/**
 * Config validation schema.
 */
export const AppConfigSchema = Joi.object({
  APP_ENV: Joi.string()
    .valid('development', 'production', 'staging', 'test')
    .default('development'),
  APP_NAME: Joi.string().default('WalletConnect Backend Client'),
  APP_DESCRIPTION: Joi.string().default(''),
  APP_URL: Joi.string().default('http://localhost:3000'),
  APP_PORT: Joi.number().default(3000),
});
