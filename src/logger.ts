import { Context, Next } from "koa";
import chalk from "chalk";
import { transports, format, createLogger } from "winston";
import "winston-daily-rotate-file";
import { config } from "./config";
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

export const logger = createLogger({
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
});

@Middleware({ type: "before" })
export class requestLogger implements KoaMiddlewareInterface {
  async use(ctx: Context, next: Next) {
    const start = new Date().getTime();
    await next();

    logger.debug(
      `Request Body: \n${JSON.stringify(ctx.request.body, null, 2)}\
      `.replace(/\n/g, "\n                        ")
    );
    logger.debug(
      `Response Body: \n${JSON.stringify(ctx.response.body, null, 2)}\
      `.replace(/\n/g, "\n                        ")
    );

    const duration = new Date().getTime() - start;
    logger.http(
      `${ctx.status} ${ctx.method} ${ctx.originalUrl} +${duration}ms`
    );
  }
}

@Middleware({ type: "before" })
export class errorHandler implements KoaMiddlewareInterface {
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
        logger.error(error); // console error on terminal (winston)
        // ctx.app.emit("error", error, ctx); // console error on terminal (official)
      }
    }
  }
}
