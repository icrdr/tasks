import { Perm, User } from "../user.entity";
import { EntityManager } from "typeorm";
import { Inject, Service } from "typedi";
import { Config } from "../../config";
import jwt from "jsonwebtoken";
import { InjectManager } from "typeorm-typedi-extensions";
import { Utility } from "../../common/common.service";
import { tokenPayload } from "../../common/common.interface";
import { InjectLogger } from "../../logger";
import { Logger } from "winston";

@Service()
export class AuthService {
  @Inject()
  private utility!: Utility;

  @InjectManager()
  private manager!: EntityManager;

  @InjectLogger()
  private logger!: Logger;

  @Inject()
  private config!: Config;

  async authUser(username: string, password: string) {
    const user = await this.manager.findOne(User, {
      username: username,
      password: this.utility.hash(username + password),
    });

    if (!user) return undefined;
    const perms = await this.manager
      .createQueryBuilder(Perm, "perm")
      .leftJoin("perm.users", "user")
      .leftJoin("perm.roles", "role")
      .leftJoin("role.users", "roleUser")
      .where("roleUser.id = :id", { id: user.id })
      .orWhere("user.id = :id", { id: user.id })
      .getMany();

    const payload: tokenPayload = {
      id: user.id,
      perms: perms.map((item) => item.code),
    };
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: "24h",
    });
  }
}
