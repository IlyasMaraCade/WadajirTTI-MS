"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
// ─── Security Headers ───────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
// ─── CORS ───────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ─── NoSQL Injection Protection ─────────────────────────────────────────────
app.use((0, express_mongo_sanitize_1.default)());
// ─── HTTP Request Logging ───────────────────────────────────────────────────
if (env_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev', {
        stream: { write: (msg) => logger_1.logger.http(msg.trim()) },
    }));
}
// ─── Rate Limiting (general) ────────────────────────────────────────────────
app.use('/api', rateLimiter_1.generalLimiter);
// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', index_1.default);
// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use(notFound_1.notFound);
// ─── Global Error Handler ───────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
exports.default = app;
