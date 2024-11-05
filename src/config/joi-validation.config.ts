import * as joi from 'joi';

export const JoiValidation = joi.object({
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),
  DB_HOST: joi.string().required(),
  DB_USER: joi.string().required(),
  DB_PORT: joi.number().required(),
  HOST_API: joi.string().required(),
  HOST_PORT: joi.number().default(3000),
  JWT_SECRET: joi.string().default('Est3esMiS3cr3t0')
})
