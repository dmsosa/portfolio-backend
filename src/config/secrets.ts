import * as dotenv from "dotenv";
import * as _ from "lodash";
import * as path from "path";

dotenv.config({path: "../env"});

export const ENVIRONMENT = _.defaultTo(process.env.ENVIRONMENT, "dev");
export const IS_PRODUCTION = ENVIRONMENT === "production";
export const PORT = _.defaultTo(process.env.PORT, "3000");
export const JWT_SECRET = _.defaultTo(process.env.PORT, "mySuperSecret");
export const SESSION_SECRET = _.defaultTo(process.env.PORT, "someString");
export const LOG_DIR = _.defaultTo(process.env.LOG_DIR, path.resolve("logs"));
export const DB = {
  USER: _.defaultTo(process.env.DB_USER, "dmsosa"),
  PASSWORD: _.defaultTo(process.env.DB_PASSWORD, "pepeeselmejor"),
  HOST: _.defaultTo(process.env.DB_HOST, "localhost"),
  NAME: _.defaultTo(process.env.DB_NAME, "developmentPortfolio"),
  PORT: _.defaultTo(process.env.DB_PORT ? parseInt(process.env.DB_PORT) : null, 27017),
}
export const ADMIN = {
  USERNAME: _.defaultTo(process.env.ADMIN_USERNAME, "admin"),
  EMAIL: _.defaultTo(process.env.ADMIN_EMAIL, "admin@admin.com"),
  PASSWORD: _.defaultTo(process.env.ADMIN_PASSWORD, "adminpassword"),
}