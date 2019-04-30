// log.helper.js

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

let logger = null;

// Printing format
const { timestamp, printf, colorize } = format;
const customPrint = printf(logData => (`[${logData.timestamp}] ${logData.level}: ${logData.message}`));
const customFormat = format.combine(
  timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  colorize(),
  customPrint,
);

// Log location and filename
const defaultLogFolder = './logs/';
const defaultNameFile = 'consistency-checker-%DATE%.log';


function buildFilePath() {
  const folder = defaultLogFolder;
  const nameFile = defaultNameFile;
  return `${folder}${nameFile}-%DATE%.log`;
}

function debug(text) {
  logger.debug(text);
}

function info(text) {
  logger.info(text);
}

function error(text) {
  logger.error(text);
}

function initLogger() {
  // const filePattern = buildFilePath();
  // const transport = new (transports.DailyRotateFile)({
  //   filename: filePattern,
  //   datePattern: 'YYYY-MM-DD-HH',
  //   maxSize: '20m',
  //   maxFiles: '5d',
  // });
  logger = createLogger({
    level: 'debug',
    format: customFormat,
    transports: [
      new transports.Console(),
      // transport,
    ],
  });
}

module.exports = {
  debug,
  info,
  error,
  initLogger,
};
