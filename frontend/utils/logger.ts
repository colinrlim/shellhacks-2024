import pino from "pino";
import fs from "fs";
import path from "path";

const isServer = typeof window === "undefined";

// Ensure the logs directory exists
if (isServer) {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
}

let logger: pino.Logger;

if (isServer) {
  // Server-side logger configuration
  logger = pino(
    {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    },
    pino.multistream([
      { stream: pino.destination(path.join(process.cwd(), "logs", "all.log")) },
      {
        stream: pino.destination(path.join(process.cwd(), "logs", "error.log")),
        level: "error",
      },
      { stream: process.stdout },
    ])
  );
} else {
  // Client-side logger configuration
  logger = pino({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    browser: {
      asObject: true,
    },
  });
}

function error(message: string, ...args: unknown[]) {
  logger.error(message, ...args);
}

function warn(message: string, ...args: unknown[]) {
  logger.warn(message, ...args);
}

function info(message: string, ...args: unknown[]) {
  logger.info(message, ...args);
}

function debug(message: string, ...args: unknown[]) {
  logger.debug(message, ...args);
}

function trace(message: string, ...args: unknown[]) {
  logger.trace(message, ...args);
}

const Logger = {
  error,
  warn,
  info,
  debug,
  trace,
};

// Export a logging interface that works on both client and server
export default Logger;
