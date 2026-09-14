import { env } from './config/env';
import { logger } from './config/logger';
import { connectDB } from './config/database';
import app from './app';
import { User } from './models/User.model';
import { Teacher } from './models/Teacher.model';
import { USER_ROLES } from './config/constants';

const seedDefaultUsers = async () => {
  try {
    const usersToSeed = [
      { firstName: 'Super', lastName: 'Admin', username: 'admin', password: 'admin123', role: USER_ROLES.SUPER_ADMIN },
      { firstName: 'Finance', lastName: 'Admin', username: 'finance', password: 'finance123', role: USER_ROLES.FINANCE },
      { firstName: 'Principal', lastName: 'Qumbo', username: 'qumbo', password: 'qumbo123', role: USER_ROLES.PRINCIPAL },
      { firstName: 'Registration', lastName: 'Staff', username: 'wadajir', password: 'wadajir123', role: USER_ROLES.REGISTRATION },
    ];

    for (const u of usersToSeed) {
      const exists = await User.findOne({ username: u.username });
      if (!exists) {
        const newUser = await User.create({
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username,
          password: u.password,
          role: u.role,
          isActive: true,
        });
        logger.info(`Seeded user: ${u.username} (${u.role})`);

      }
    }
  } catch (error) {
    logger.error('Failed to seed users:', error);
  }
};

const startServer = async (): Promise<void> => {
  await connectDB();
  await seedDefaultUsers();

 const server = app.listen(env.PORT, '0.0.0.0', () => { 
    logger.info('  Wadajir Technical and Training Institute - Backend API Started'); 
    logger.info(`  API Base: http://10.220.91.17:${env.PORT}/api/v1`); 
});

  const shutdown = (signal: string) => {
    logger.warn(`${signal} received - shutting down gracefully...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
};

startServer();
