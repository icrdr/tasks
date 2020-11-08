import {
  JsonController,
  Param,
  Body,
  Get,
  Post,
  QueryParams,
  Delete,
  NotFoundError,
  ForbiddenError,
  Authorized,
  CurrentUser,
} from "routing-controllers";
import { Inject } from "typedi";
import { currentUser } from "../../common/common.interface";
import { IsString, IsNumber } from "class-validator";
import { InjectLogger } from "../../logger";
import { Logger } from "winston";
import { UserService } from "../services/user.service";

class CreateUserDTO {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

class GetUsersDTO {
  @IsNumber()
  perPage!: number;

  @IsNumber()
  page!: number;
}

@JsonController("/users")
export class UserController {
  @Inject()
  private userService!: UserService;
  @InjectLogger()
  private logger!: Logger;

  @Authorized(["admin.user.browse", "common.user.browse"])
  @Get("/:id")
  async getUser(@CurrentUser() current: currentUser, @Param("id") id: number) {
    const user = await this.userService.getUser(id);
    if (!user) throw new NotFoundError("User was not found.");
    return user;
  }

  @Get()
  async getUsers(@QueryParams() query: GetUsersDTO) {
    const users = await this.userService.getUsers({
      perPage: query.perPage,
      page: query.page,
    });
    return users;
  }

  @Post()
  async createUser(@Body() body: CreateUserDTO) {
    const user = await this.userService.getUser(body.username);
    if (user) throw new ForbiddenError("Username existed");

    return this.userService.createUser({
      username: body.username,
      password: body.password,
    });
  }

  @Delete("/:id")
  async deleteUser(@Param("id") id: number) {
    const user = await this.userService.getUser(id);
    if (!user) throw new NotFoundError("User was not found.");

    await this.userService.deleteUser(id);
    return { message: "Deleted" };
  }
}
