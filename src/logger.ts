require('winston-daily-rotate-file');
import * as winston from 'winston';
import * as path from 'path';

// @ts-ignore
const transport = new winston.transports.DailyRotateFile({
  filename: 'pillar-%DATE%.log',
  dirname: path.resolve(__dirname, './../logs'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
});

export const logger = winston.createLogger({
  transports: [transport],
});
