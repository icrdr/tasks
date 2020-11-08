import { Role, User } from "./user.entity";
import { EntityManager } from "typeorm";
import { Inject, Service } from "typedi";
import { OptionService } from "../option/option.service";
import { InjectManager } from "typeorm-typedi-extensions";
import { RoleService } from "./role.service";
import { isRoleArray } from "../typeGuad";
import { hash } from "../utility";

@Service()
export class UserService {
  @Inject()
  private optionService!: OptionService;

  @Inject(() => RoleService)
  private roleService!: RoleService;

  @InjectManager()
  private manager!: EntityManager;

  async getUser(identify: string | number): Promise<User | undefined> {
    return typeof identify === "string"
      ? await this.manager.findOne(User, { username: identify })
      : await this.manager.findOne(User, identify);
  }

  async getUsers(options: { perPage: number; page: number }) {
    return await this.manager.findAndCount(User, {
      take: options.perPage,
      skip: options.page,
    });
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
      _roles.push((await this.roleService.getRole(defaultRole))!);
    } else if (!isRoleArray(options.roles)) {
      for (const identify of options.roles) {
        _roles.push((await this.roleService.getRole(identify))!);
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

  async deleteUser(identify: string | number): Promise<void> {
    typeof identify === "string"
      ? await this.manager.softDelete(User, { username: identify })
      : await this.manager.softDelete(User, identify);
  }
}
