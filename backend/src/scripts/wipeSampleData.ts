import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User.model';
import { Student } from '../models/Student.model';
import { Teacher } from '../models/Teacher.model';
import { Class } from '../models/Class.model';
import { Section } from '../models/Section.model';
import { Subject } from '../models/Subject.model';
import { AcademicYear } from '../models/AcademicYear.model';
import Attendance from '../models/Attendance.model';
import Exam from '../models/Exam.model';
import Mark from '../models/Mark.model';
import { Invoice } from '../models/Invoice.model';
import { Payment } from '../models/Payment.model';
import { Expense } from '../models/Expense.model';

const wipeSampleData = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to DB:', env.MONGODB_URI);

    console.log('Wiping sample data...');

    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Section.deleteMany({});
    await Subject.deleteMany({});
    await AcademicYear.deleteMany({});
    await Attendance.deleteMany({});
    await Exam.deleteMany({});
    await Mark.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});
    
    // Delete all users EXCEPT the super admin
    const deleteUsers = await User.deleteMany({ role: { $ne: 'SUPER_ADMIN' } });

    console.log(`Successfully deleted ${deleteUsers.deletedCount} non-admin users.`);
    console.log('All sample data wiped. System is ready for production.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error wiping data:', error);
    process.exit(1);
  }
};

wipeSampleData();
