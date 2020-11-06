import { Perm, Role, User } from "./user.entity";
import { EntityManager } from "typeorm";
import { Inject, Service } from "typedi";
import { hash } from "../utils";
import { config } from "../config";
import jwt from "jsonwebtoken";
import { OptionService } from "../option/option.service";
import { InjectManager } from "typeorm-typedi-extensions";

@Service()
export class UserService {
  @Inject()
  optionService!: OptionService;

  @InjectManager()
  private manager!: EntityManager;

  async getUser(identify: string | number): Promise<User | undefined> {
    return typeof identify === "string"
      ? await this.manager.findOne(User, { username: identify })
      : await this.manager.findOne(User, identify);
  }

  isRoleArray(roles: Role[] | number[] | string[]): roles is Role[] {
    return roles[0] instanceof Role;
  }

  async createUser(options: {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
    mobile?: string | undefined;
    roles?: Role[] | number[] | string[];
  }) {
    let _roles: Role[] = [];
    if (!options.roles) {
      const defaultRole = (await this.optionService.getOption("defaultRole"))!
        .value;
      _roles.push((await this.getRole(defaultRole))!);
    } else if (!this.isRoleArray(options.roles)) {
      for (const identify of options.roles) {
        _roles.push((await this.getRole(identify))!);
      }
    } else {
      _roles = options.roles;
    }

    const user = new User();
    user.username = options.username;
    user.password = hash(options.username + options.password);
    if (options.fullName) user.fullName = options.fullName;
    if (options.email) user.email = options.email;
    if (options.mobile) user.mobile = options.mobile;
    user.roles = _roles;
    await this.manager.save(user);
    return user;
  }

  async getUsers(options: { perPage: number; page: number }) {
    return await this.manager.findAndCount(User, {
      take: options.perPage,
      skip: options.page,
    });
  }

  async authUser(username: string, password: string) {
    const user = await this.manager.findOne(User, {
      username: username,
      password: hash(username + password),
    });

    if (!user) return undefined;
    const perms = await this.manager
      .createQueryBuilder(Perm, "perm")
      .innerJoin("perm.roles", "role")
      .innerJoin("role.users", "user")
      .where("user.id = :id", { id: user.id })
      .getMany();

    const payload = {
      id: user.id,
      perms: perms.map((item) => item.code),
    };
    console.log(payload);
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: "24h",
    });
  }

  async deleteUser(identify: string | number): Promise<void> {
    typeof identify === "string"
      ? await this.manager.delete(User, { username: identify })
      : await this.manager.delete(User, identify);
  }

  async getRole(identify: string | number): Promise<Role | undefined> {
    return typeof identify === "string"
      ? await this.manager.findOne(Role, { name: identify })
      : await this.manager.findOne(Role, identify);
  }

  isPermArray(perms: Perm[] | number[] | string[]): perms is Perm[] {
    return perms[0] instanceof Perm;
  }

  async createRole(options: {
    name: string;
    perms: Perm[] | number[] | string[];
  }) {
    let _perms: Perm[] = [];
    if (!this.isPermArray(options.perms)) {
      for (const identify of options.perms) {
        _perms.push((await this.loadPerm(identify))!);
      }
    } else {
      _perms = options.perms;
    }

    const role = new Role();
    role.name = options.name;
    role.perms = _perms;
    await this.manager.save(role);
    return role;
  }

  async loadPerm(identify: string | number): Promise<Perm | undefined> {
    return typeof identify === "string"
      ? await this.manager.preload(Perm, { code: identify })
      : await this.manager.findOne(Perm, identify);
  }
}
