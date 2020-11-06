import { Perm, Role } from "../user.entity";
import { EntityManager } from "typeorm";
import { Inject, Service } from "typedi";
import { InjectManager } from "typeorm-typedi-extensions";
import { TypeGuard } from "../../common/common.service";

@Service("roleService")
export class RoleService {
  @Inject()
  private typeGuard!: TypeGuard;

  @InjectManager()
  private manager!: EntityManager;

  async getRole(identify: string | number): Promise<Role | undefined> {
    return typeof identify === "string"
      ? await this.manager.findOne(Role, { name: identify })
      : await this.manager.findOne(Role, identify);
  }

  async createRole(options: {
    name: string;
    role?: Role | number | string;
    perms?: Perm[] | number[] | string[];
  }) {
    let _perms: Perm[] = [];
    if (!options.perms) {
    } else if (!this.typeGuard.isPermArray(options.perms)) {
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
      ? (await this.manager.findOne(Perm, { code: identify })) ||
          (await this.manager.save(
            Perm,
            this.manager.create(Perm, { code: identify })
          ))
      : await this.manager.findOne(Perm, identify);
  }
}
