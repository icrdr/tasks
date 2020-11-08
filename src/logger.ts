import chalk from "chalk";
import { transports, format, createLogger, Logger } from "winston";
import "winston-daily-rotate-file";
import { config } from "./config";
import { Container } from "typedi";
import { Context, Next } from "koa";
import { KoaMiddlewareInterface, Middleware } from "routing-controllers";


const loggerContent = (isColored: boolean) => {
  return format.printf(({ timestamp, level, message, stack }) => {
    const prefix = `${chalk.gray(timestamp)} `;
    level = level.toUpperCase();
    let suffix: string;
    switch (level) {
      case "ERROR":
        suffix = `${chalk.bgRed.black(level)} ${chalk.red(message)} \
        \n${chalk.red(stack)}`.replace(/\n/g, "\n                        ");
        break;
      case "WARN":
        suffix = `${chalk.bgYellow.black(level)} ${chalk.yellow(message)}`;
        break;
      case "INFO":
        suffix = `${chalk.bgGreen.black(level)} ${chalk.green(message)}`;
        break;
      case "HTTP":
        suffix = `${chalk.bgCyan.black(level)} ${chalk.cyan(message)}`;
        break;
      case "DEBUG":
        suffix = `${chalk.bgGrey.black(level)} ${chalk.grey(message)}`;
        break;
      default:
        suffix = `${chalk.bgRed.black(level)} ${chalk.red(message)}`;
        break;
    }
    if (isColored) {
      return prefix + suffix;
    } else {
      return (prefix + suffix).replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      );
    }
  });
};

const loggerOption = {
  level: config.logLevel,
  format: format.combine(
    format.timestamp({
      format: "YY-MM-DD HH:MM:SS",
    }),
    format.errors({ stack: true })
  ),
  transports: [
    new transports.DailyRotateFile({
      format: format.combine(loggerContent(false)),
      filename: "%DATE%.log",
      dirname: "log",
      datePattern: "YYYY-MM-DD",
      level: "http",
    }),
    new transports.Console({
      silent: config.logSilent,
      format: format.combine(loggerContent(true)),
    }),
  ],
};
export const logger = createLogger(loggerOption);

export const InjectLogger = () => {
  return function (object: Object, propertyName: string, index?: number) {
    const logger = createLogger(loggerOption);
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: (containerInstance) => logger,
    });
  };
};

@Middleware({ type: "before" })
export class requestLogger implements KoaMiddlewareInterface {
  @InjectLogger()
  logger!: Logger;

  async use(ctx: Context, next: Next) {
    const start = new Date().getTime();
    await next();

    this.logger.debug(
      `Request Body: \n${JSON.stringify(ctx.request.body, null, 2)}\
      `.replace(/\n/g, "\n                        ")
    );
    this.logger.debug(
      `Response Body: \n${JSON.stringify(ctx.response.body, null, 2)}\
      `.replace(/\n/g, "\n                        ")
    );

    const duration = new Date().getTime() - start;
    this.logger.http(
      `${ctx.status} ${ctx.method} ${ctx.originalUrl} +${duration}ms`
    );
  }
}

@Middleware({ type: "before" })
export class errorHandler implements KoaMiddlewareInterface {
  @InjectLogger()
  logger!: Logger;

  async use(ctx: Context, next: Next) {
    try {
      await next();
    } catch (error) {
      //catch error and build respound
      ctx.status = error.httpCode || error.status || 500;
      ctx.body = {
        message: error.message,
      };
      if (error.errors) ctx.body["errors"] = error.errors;
      if (ctx.status >= 500) {
        this.logger.error(error); // console error on terminal (winston)
        // ctx.app.emit("error", error, ctx); // console error on terminal (official)
      }
    }
  }
}