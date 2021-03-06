import dotenv from "dotenv";
dotenv.config();

export const config = {
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: 3306,
  dbDatabase:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_DATABASE
      : process.env.DB_DATABASE,
  dbUsername:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_USERNAME
      : process.env.DB_USERNAME,
  dbPassword:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_PASSWORD
      : process.env.DB_PASSWORD,
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  jwtSecret: process.env.JWT_SECRET || 'app',
  logLevel: process.env.NODE_ENV === 'prod' ? 'http' : 'debug',
  logSilent: process.env.NODE_ENV === 'test',
  defaultRoles: {
    admin: ['*'],
    user: ['common.*', 'common.user.*'],
  },
  defaultOptions: {
    defaultRole: 'user',
    registrable: '1',
  },
}
