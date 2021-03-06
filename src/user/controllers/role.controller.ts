import { JsonController } from "routing-controllers";
import { RoleService } from "../services/role.service";
import { Inject } from "typedi";

@JsonController("/role")
export class RoleController {
  @Inject()
  private roleService!: RoleService;
}
