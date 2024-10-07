import "server-only";
import winston from "winston";

const transports: winston.transport[] = [new winston.transports.Console()];

const Logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: transports,
});

export default Logger;
