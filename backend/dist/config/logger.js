"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("./env");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const developmentFormat = combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), printf(({ timestamp, level, message, stack }) => {
    return stack
        ? `${timestamp} [${level}]: ${message}\n${stack}`
        : `${timestamp} [${level}]: ${message}`;
}));
const productionFormat = combine(timestamp(), errors({ stack: true }), winston_1.default.format.json());
exports.logger = winston_1.default.createLogger({
    level: env_1.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: env_1.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
    transports: [
        new winston_1.default.transports.Console(),
        ...(env_1.env.NODE_ENV === 'production'
            ? [
                new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
            ]
            : []),
    ],
});
