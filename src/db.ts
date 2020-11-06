import Container, { Inject, Service } from "typedi";
import { Connection, createConnection, useContainer } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Config } from "./config";
import { RoleService, UserService } from "./user/user.service";
import { internet } from "faker";
import { OptionService } from "./option/option.service";
import { InjectConnection } from "typeorm-typedi-extensions";

@Service()
export class DbDriver {
  @Inject()
  private userService!: UserService;

  @Inject()
  private roleService!: RoleService;

  @Inject()
  private optionService!: OptionService;

  connection: Connection;
  // @InjectConnection()
  // private connection!: Connection;
  // config: Config;
  @Inject()
  private config!: Config;

  constructor(connection: Connection) {
    this.connection = connection;
    // this.userService = Container.get(UserService);
    // this.roleService = Container.get(RoleService);
    // this.optionService = Container.get(OptionService);
    // this.config = Container.get(Config);
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
    console.log(this.config);
    // create default options
    for (const key in this.config.defaultOptions) {
      const value: string = this.config.defaultOptions[key];
      await this.optionService.createOption(key, value);
    }

    // create default roles
    for (const key in this.config.defaultRole) {
      await this.roleService.createRole({
        name: key,
        perms: this.config.defaultRole[key],
      });
    }

    //create default user (admin)
    await this.userService.createUser({
      username: this.config.adminUsername,
      password: this.config.adminPassword,
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
  const config = Container.get(Config);
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
