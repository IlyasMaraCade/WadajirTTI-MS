"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const app_1 = __importDefault(require("./app"));
const User_model_1 = require("./models/User.model");
const constants_1 = require("./config/constants");
const seedInitialAdmin = async () => {
    try {
        const adminCount = await User_model_1.User.countDocuments({ role: constants_1.USER_ROLES.SUPER_ADMIN });
        if (adminCount === 0) {
            await User_model_1.User.create({
                firstName: 'System',
                lastName: 'Admin',
                email: env_1.env.INITIAL_ADMIN_EMAIL,
                password: env_1.env.INITIAL_ADMIN_PASSWORD,
                role: constants_1.USER_ROLES.SUPER_ADMIN,
                isActive: true,
            });
            logger_1.logger.info(`✅ Initial Super Admin created (${env_1.env.INITIAL_ADMIN_EMAIL})`);
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to seed initial admin:', error);
    }
};
const startServer = async () => {
    // Connect to database
    await (0, database_1.connectDB)();
    // Seed initial admin if needed
    await seedInitialAdmin();
    // Start HTTP server
    const server = app_1.default.listen(env_1.env.PORT, () => {
        logger_1.logger.info('─────────────────────────────────────────────');
        logger_1.logger.info('  Wadajir Technical and Training Institute');
        logger_1.logger.info('  Management System — Backend API');
        logger_1.logger.info(`  Environment : ${env_1.env.NODE_ENV}`);
        logger_1.logger.info(`  Port        : ${env_1.env.PORT}`);
        logger_1.logger.info(`  API Base    : http://localhost:${env_1.env.PORT}/api/v1`);
        logger_1.logger.info(`  Health      : http://localhost:${env_1.env.PORT}/api/v1/health`);
        logger_1.logger.info('─────────────────────────────────────────────');
    });
    // Graceful shutdown
    const shutdown = (signal) => {
        logger_1.logger.warn(`${signal} received — shutting down gracefully...`);
        server.close(() => {
            logger_1.logger.info('HTTP server closed');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        logger_1.logger.error('Unhandled Promise Rejection:', reason);
        server.close(() => process.exit(1));
    });
    process.on('uncaughtException', (err) => {
        logger_1.logger.error('Uncaught Exception:', err);
        process.exit(1);
    });
};
startServer();
