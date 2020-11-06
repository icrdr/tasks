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
import { UserService } from "./user.service";
import { AuthUserDTO, CreateUserDTO, GetUsersDTO } from "./user.dto";
import { Inject } from "typedi";
import { currentUser } from "../interface";

@JsonController("/users")
export class UserController {
  @Inject()
  userService!: UserService;

  @Authorized(["admin.user.browse", "common.user.browse"])
  @Get("/:id")
  async getUser(@CurrentUser() current: currentUser, @Param("id") id: number) {
    console.log(current);
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

@JsonController("/auth")
export class AuthController {
  @Inject()
  userService!: UserService;

  @Post()
  async authUser(@Body() body: AuthUserDTO) {
    const token = await this.userService.authUser(body.username, body.password);
    if (!token) throw new NotFoundError("Auth Fail");

    return { token: token };
  }
}
