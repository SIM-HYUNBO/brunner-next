import { createLogger, transports, format, addColors } from "winston";
// import winstonDaily from "winston-daily-rotate-file";

var alignColorsAndTime = format.combine(
    format.colorize({
        all: true,
    }),
    format.label({
        label: "[LOGGER]",
    }),
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    format.printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
);

var notalignColorsAndTime = format.combine(
    format.label({
        label: "[LOGGER]",
    }),
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    format.printf((info) => `${info.timestamp} ${info.level}\n${info.message}`)
);

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'gray'
}

addColors(colors)

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.errors({ stack: true })
    ),
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), alignColorsAndTime),
        })
    ]
});

module.exports = logger;