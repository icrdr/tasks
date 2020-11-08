import "reflect-metadata";
import { Action, createKoaServer } from "routing-controllers";
import { useContainer } from "routing-controllers";
import { Container } from "typedi";
import jwt from "jsonwebtoken";
import { tokenPayload, currentUser } from "./common/common.interface";
import { stringMatch } from "./utility";
import { config } from "./config";
import { requestLogger, errorHandler } from "./logger";

const authorizationChecker = async (action: Action, roles: string[]) => {
  const token = action.request.headers["authorization"].split(" ")[1];
  const decodedToken = jwt.verify(token, config.jwtSecret) as tokenPayload;
  const ownedPerms = decodedToken.perms;
  const validated: string[] = [];
  for (const neededPerm of roles) {
    for (const ownedPerm of ownedPerms) {
      if (stringMatch(neededPerm, ownedPerm)) {
        validated.push(neededPerm);
        break; //break nested loop
      }
    }
  }
  if (!validated) return false;

  const currentUser: currentUser = {
    id: decodedToken.id,
    perms: validated,
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
