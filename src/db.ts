import Container from "typedi";
import { Connection, createConnection, useContainer } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { config } from "./config";
import { UserService } from "./user/user.service";
import { internet } from "faker";
import { OptionService } from "./option/option.service";

const defaultOptions: { [key: string]: string } = {
  defaultRole: "user",
  registrable: "1",
};

const defaultPerms: string[] = [
  "admin",
  "admin.user",
  "admin.option",
  "common",
  "common.user",
];

const defaultRole: { [key: string]: string[] } = {
  admin: ["admin", "common"],
  user: ["common", "common.user"],
};

export class DbDriver {
  userService: UserService;
  optionService: OptionService;
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.userService = Container.get(UserService);
    this.optionService = Container.get(OptionService);
  }

  async createFakeUsers(number: number) {
    const users = [];

    for (const {} of Array(number)) {
      const user = await this.userService.createUser({
        username: internet.userName(),
        password: internet.password(),
      });
      users.push(user);
    }
    return users;
  }

  async createFakeTasks() {
    //TODO: fake task
  }

  async createDefault() {
    // create default options
    for (const key in defaultOptions) {
      await this.optionService.createOption(key, defaultOptions[key]);
    }

    // create default perms
    // for (const code of defaultPerms) {
    //   await this.userService.createPerm(code);
    // }

    // create default roles
    for (const key in defaultRole) {
      await this.userService.createRole({ name: key, perms: defaultRole[key] });
    }

    //create default user (admin)
    await this.userService.createUser({
      username: config.adminUsername,
      password: config.adminPassword,
      roles: ["admin"],
    });
  }

  async close() {
    await this.connection.close();
  }

  async clear() {
    await this.connection.dropDatabase();
    await this.connection.synchronize();
  }
}

export const createDb = async (entities?: Function[] | string[]) => {
  if (!entities) entities = [__dirname + "/**/*.entity.ts"];
  useContainer(Container);
  const connection = await createConnection({
    type: "mysql",
    port: 3306,
    database: config.dbDatabase,
    username: config.dbUsername,
    password: config.dbPassword,
    entities: entities,
    synchronize: true,
    namingStrategy: new SnakeNamingStrategy(),
  });
  return new DbDriver(connection);
};
