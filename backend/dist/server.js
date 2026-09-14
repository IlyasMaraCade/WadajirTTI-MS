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
const Teacher_model_1 = require("./models/Teacher.model");
const constants_1 = require("./config/constants");
const seedDefaultUsers = async () => {
    try {
        const usersToSeed = [
            { firstName: 'Super', lastName: 'Admin', username: 'admin', password: 'admin123', role: constants_1.USER_ROLES.SUPER_ADMIN },
            { firstName: 'Finance', lastName: 'Admin', username: 'finance', password: 'finance123', role: constants_1.USER_ROLES.FINANCE },
            { firstName: 'Teacher', lastName: 'Test', username: 'teacher', password: 'teacher123', role: constants_1.USER_ROLES.TEACHER },
            { firstName: 'Principal', lastName: 'Qumbo', username: 'qumbo', password: 'qumbo123', role: constants_1.USER_ROLES.PRINCIPAL },
            { firstName: 'Registration', lastName: 'Staff', username: 'wadajir', password: 'wadajir123', role: constants_1.USER_ROLES.REGISTRATION },
        ];
        for (const u of usersToSeed) {
            const exists = await User_model_1.User.findOne({ username: u.username });
            if (!exists) {
                const newUser = await User_model_1.User.create({
                    firstName: u.firstName,
                    lastName: u.lastName,
                    username: u.username,
                    password: u.password,
                    role: u.role,
                    isActive: true,
                });
                logger_1.logger.info(`Seeded user: ${u.username} (${u.role})`);
                // Also seed teacher profile if teacher
                if (u.role === constants_1.USER_ROLES.TEACHER) {
                    const teacherExists = await Teacher_model_1.Teacher.findOne({ user: newUser._id });
                    if (!teacherExists) {
                        await Teacher_model_1.Teacher.create({
                            teacherId: 'T-001',
                            fullName: `${u.firstName} ${u.lastName}`,
                            phone: '1234567890',
                            employmentStatus: 'Active',
                            subjects: [],
                            user: newUser._id,
                        });
                        logger_1.logger.info(`Seeded Teacher profile for: ${u.username}`);
                    }
                }
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to seed users:', error);
    }
};
const startServer = async () => {
    await (0, database_1.connectDB)();
    await seedDefaultUsers();
    const server = app_1.default.listen(env_1.env.PORT, '0.0.0.0', () => {
        logger_1.logger.info('  Wadajir Technical and Training Institute - Backend API Started');
        logger_1.logger.info(`  API Base: http://10.220.91.17:${env_1.env.PORT}/api/v1`);
    });
    const shutdown = (signal) => {
        logger_1.logger.warn(`${signal} received - shutting down gracefully...`);
        server.close(() => process.exit(0));
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
