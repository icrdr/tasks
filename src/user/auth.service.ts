import { Perm, User } from "./user.entity";
import { EntityManager } from "typeorm";
import { Inject, Service } from "typedi";
import jwt from "jsonwebtoken";
import { InjectManager } from "typeorm-typedi-extensions";
import { tokenPayload } from "../common/common.interface";
import { hash } from "../utility";
import { config } from "../config";

@Service()
export class AuthService {

  @InjectManager()
  private manager!: EntityManager;


  async authUser(username: string, password: string) {
    const user = await this.manager.findOne(User, {
      username: username,
      password: hash(username + password),
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
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: "24h",
    });
  }
}
