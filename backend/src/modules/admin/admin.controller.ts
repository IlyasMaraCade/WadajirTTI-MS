import { Request, Response } from 'express';
import { Student } from '../../models/Student.model';
import { Teacher } from '../../models/Teacher.model';
import { Class } from '../../models/Class.model';
import { Section } from '../../models/Section.model';
import { Subject } from '../../models/Subject.model';
import { AcademicYear } from '../../models/AcademicYear.model';
import { Term } from '../../models/Term.model';
import { Enrollment } from '../../models/Enrollment.model';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSections,
    totalSubjects,
    activeYear,
    activeTerm
  ] = await Promise.all([
    Student.countDocuments({ status: true }),
    Teacher.countDocuments({ employmentStatus: 'Active' }),
    Class.countDocuments({ isActive: true }),
    Section.countDocuments({ isActive: true }),
    Subject.countDocuments({ isActive: true }),
    AcademicYear.findOne({ isActive: true }),
    Term.findOne({ isActive: true })
  ]);

  let activeEnrollments = 0;
  if (activeYear) {
    activeEnrollments = await Enrollment.countDocuments({ academicYear: activeYear._id, status: 'Active' });
  }

  ApiResponse.success(res, {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSections,
    totalSubjects,
    activeEnrollments,
    activeYear: activeYear ? activeYear.year : 'None',
    activeTerm: activeTerm ? activeTerm.name : 'None'
  });
});