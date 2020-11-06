import "reflect-metadata";
import { errorHandler, requestLogger } from "./logger";
import { Action, createKoaServer } from "routing-controllers";
import { useContainer } from "routing-controllers";
import { Container } from "typedi";
import jwt from "jsonwebtoken";
import { config } from "./config";
import { currentUser } from "./interface";

const authorizationChecker = async (action: Action, roles: string[]) => {
  const token = action.request.headers["authorization"].split(" ")[1];
  const decodedToken: any = jwt.verify(token, config.jwtSecret);
  const ownedPermissions = decodedToken.permissions;
  const validated: string[] = [];
  for (const neededPermission of roles) {
    for (const ownedPermission of ownedPermissions) {
      if (neededPermission.includes(ownedPermission)) {
        validated.push(neededPermission);
        break; //break nested loop
      }
    }
  }
  if (!validated) return false;

  const currentUser: currentUser = {
    id: decodedToken.id,
    permissions: validated,
  };
  action.request.currentUser = currentUser;

  return true;
};

const currentUserChecker = async (action: Action) => {
  return action.request.currentUser;
};

export const createApp = (controllers?: Function[] | string[]) => {
  if (!controllers) controllers = [__dirname + "/**/*.controller.ts"];
  useContainer(Container);
  const app = createKoaServer({
    authorizationChecker: authorizationChecker,
    currentUserChecker: currentUserChecker,
    routePrefix: "/api",
    defaultErrorHandler: false,
    controllers: controllers,
    middlewares: [requestLogger, errorHandler],
  });
  return app;
};
