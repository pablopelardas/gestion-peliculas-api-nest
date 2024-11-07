export const EnvConfiguration = () => ({
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  dbHost: process.env.DB_HOST,
  dbUser: process.env.DB_USER,
  dbPort: process.env.DB_PORT,
  hostApi: process.env.HOST_API,
  hostPort: process.env.HOST_PORT,
  jwtSecret: process.env.JWT_SECRET,
  defaultLimit: process.env.DEFAULT_LIMIT
})
