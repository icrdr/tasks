import { JsonController } from "routing-controllers";
import { RoleService } from "../user.service";
import { Inject } from "typedi";

@JsonController("/role")
export class RoleController {
  @Inject()
  private authService!: RoleService;
}
