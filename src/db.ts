import Container from "typedi";
import { Connection, createConnection, useContainer } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { config } from "./config";
import { internet } from "faker";
import { OptionService } from "./option/option.service";
import { RoleService } from "./user/role.service";
import { UserService } from "./user/user.service";

export class DbDriver {
  userService!: UserService;
  roleService!: RoleService;
  optionService!: OptionService;
  connection!: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.userService = Container.get(UserService);
    this.roleService = Container.get(RoleService);
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
    const defaultOptions = config.defaultOptions as { [key: string]: string };
    const defaultRole = config.defaultRoles as { [key: string]: string[] };

    for (const key in defaultOptions) {
      const value: string = defaultOptions[key];
      await this.optionService.createOption(key, value);
    }

    // create default roles
    for (const key in defaultRole) {
      await this.roleService.createRole({
        name: key,
        perms: defaultRole[key],
      });
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
