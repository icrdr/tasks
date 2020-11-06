import dotenv from "dotenv";
import { Service } from "typedi";
dotenv.config();

@Service()
export class Config {
  dbHost?: string = process.env.DB_HOST;
  dbDatabase?: string =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DATABASE
      : process.env.DB_DATABASE;
  dbUsername?: string =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_USERNAME
      : process.env.DB_USERNAME;
  dbPassword?: string =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_PASSWORD
      : process.env.DB_PASSWORD;
  adminUsername: string = process.env.ADMIN_USERNAME || "admin";
  adminPassword: string = process.env.ADMIN_PASSWORD || "admin";
  jwtSecret: string = process.env.JWT_SECRET || "app";
  logLevel: string = process.env.NODE_ENV === "prod" ? "http" : "debug";
  logSilent: boolean = process.env.NODE_ENV === "test";
  port: number = 3000;
  defaultRole: { [key: string]: string[] } = {
    admin: ["*"],
    user: ["common.*", "common.user.*"],
  };
  defaultOptions: { [key: string]: string } = {
    defaultRole: "user",
    registrable: "1",
  };
}
