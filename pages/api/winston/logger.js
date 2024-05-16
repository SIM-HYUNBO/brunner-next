import winston from "winston";
// import winstonDaily from "winston-daily-rotate-file";

var alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
        all: true,
    }),
    winston.format.label({
        label: "[LOGGER]",
    }),
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    winston.format.printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
);

var notalignColorsAndTime = winston.format.combine(
    winston.format.label({
        label: "[LOGGER]",
    }),
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}\n${info.message}`)
);

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'gray'
}
winston.addColors(colors)

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

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;