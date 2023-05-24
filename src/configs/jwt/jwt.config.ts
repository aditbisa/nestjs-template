import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Config registration.
 */
export const JwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
}));

/**
 * Config validation schema.
 */
export const JwtConfigSchema = Joi.object({
  JWT_SECRET: Joi.string(),
  JWT_EXPIRES_IN: Joi.number().default('3600'),
});
