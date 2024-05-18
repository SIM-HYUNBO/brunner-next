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

// const logger = winston.createLogger({
//     level: "debug",
//     transports: [
//         new winstonDaily({
//             filename: "/var/logs",
//             zippedArchive: true,
//             format: winston.format.combine(notalignColorsAndTime),
//         }),

//         new winston.transports.Console({
//             format: winston.format.combine(winston.format.colorize(), alignColorsAndTime),
//         }),
//     ],
// });

const logger = createLogger({
    format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' })),
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), alignColorsAndTime),
        }),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
    ]
});


module.exports = logger;