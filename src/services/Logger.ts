import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'crypto-manager' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  generateErrorId(): string {
    return uuidv4();
  }

  error(message: string, error: any, context?: any) {
    const errorId = this.generateErrorId();
    this.logger.error({
      errorId,
      message,
      error: error instanceof Error ? error.stack : error,
      context,
      timestamp: new Date()
    });
    return errorId;
  }

  info(message: string, context?: any) {
    this.logger.info({
      message,
      context,
      timestamp: new Date()
    });
  }

  warn(message: string, context?: any) {
    this.logger.warn({
      message,
      context,
      timestamp: new Date()
    });
  }

  debug(message: string, context?: any) {
    this.logger.debug({
      message,
      context,
      timestamp: new Date()
    });
  }
}

export const logger = new Logger(); 