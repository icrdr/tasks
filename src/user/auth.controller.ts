import { JsonController, Body, Post, NotFoundError } from "routing-controllers";
import { AuthService } from "./auth.service";
import { Inject } from "typedi";
import { IsString } from "class-validator";

class AuthUserDTO {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

@JsonController("/auth")
export class AuthController {
  @Inject()
  private authService!: AuthService;

  @Post()
  async authUser(@Body() body: AuthUserDTO) {
    const token = await this.authService.authUser(body.username, body.password);
    if (!token) throw new NotFoundError("Auth Fail");

    return { token: token };
  }
}
