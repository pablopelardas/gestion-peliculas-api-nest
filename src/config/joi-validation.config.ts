import * as joi from 'joi';

export const JoiValidation = joi.object({
  dbPassword: joi.string().required(),
  dbName: joi.string().required(),
  dbHost: joi.string().required(),
  dbUser: joi.string().required(),
  dbPort: joi.number().required(),
  hostApi: joi.string().required(),
  hostPort: joi.number().default(3000),
  jwtSecret: joi.string().default('Est3esMiS3cr3t0')
})
