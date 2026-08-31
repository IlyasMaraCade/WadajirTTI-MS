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
      { firstName: 'Teacher', lastName: 'Wadajir', username: 'wadajir', password: '123456', role: USER_ROLES.TEACHER },
      { firstName: 'Principal', lastName: 'Qumbo', username: 'qumbo', password: 'qumbo123', role: USER_ROLES.PRINCIPAL },
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

        // Also seed teacher profile if teacher
        if (u.role === USER_ROLES.TEACHER) {
          const teacherExists = await Teacher.findOne({ user: newUser._id });
          if (!teacherExists) {
            await Teacher.create({
              teacherId: 'T-001',
              fullName: `${u.firstName} ${u.lastName}`,
              phone: '1234567890',
              employmentStatus: 'Active',
              subjects: ['English'],
              dateJoined: new Date(),
              user: newUser._id,
            });
            logger.info(`Seeded Teacher profile for: ${u.username}`);
          }
        }
      }
    }
  } catch (error) {
    logger.error('Failed to seed users:', error);
  }
};

const startServer = async (): Promise<void> => {
  await connectDB();
  await seedDefaultUsers();

  const server = app.listen(env.PORT, () => {
    logger.info('  Wadajir Technical and Training Institute - Backend API Started');
    logger.info(`  API Base: http://localhost:${env.PORT}/api/v1`);
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
