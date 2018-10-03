const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const { format, transports } = winston;
const { combine, timestamp, printf } = format;

const myFormat = printf(info => {
  let msgStr = info.message;
  msgStr = typeof msgStr === 'string' ? msgStr : JSON.stringify(msgStr);

  let metaStr = info.meta ? JSON.stringify(info.meta) : '';
  // info.message = `${info.timestamp} [${info.label}] ${msgStr} ${metaStr}`;
  info.message = `${info.timestamp} ${msgStr} ${metaStr}`;

  return info.message
});

const logLabel = path.parse(__filename).name;

var transport = new(winston.transports.DailyRotateFile)({
  label: 'drf',
  timestamp: true,
  json: true,
  dirname: './logs',
  filename: 'whatsThat-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
});


var logger = winston.createLogger({
  format: combine(
    timestamp(),
    format.splat(),
    // format.label({
    //   label: logLabel
    // }),
    myFormat,
  ),
  level: 'debug',
  transports: [
    transport,
    new transports.Console({
      // format: combine(
      //   format.colorize(),
        
      // ) 
    })
  ]
});

logger.info('---------- Started ----------');
// for testing
// logger.info({ ab: 12 });
// logger.info({ ab: 12 }, { bc: 23 });
// logger.info({ ab: 12 }, { bc: 23 }, { cd: 34 });
// logger.info('str1', 'str2');
// logger.info('str1', 'str2', 'str3');

module.exports = logger;