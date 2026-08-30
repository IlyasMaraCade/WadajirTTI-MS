"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Student_model_1 = require("../../models/Student.model");
const Teacher_model_1 = require("../../models/Teacher.model");
const Class_model_1 = require("../../models/Class.model");
const Section_model_1 = require("../../models/Section.model");
const Subject_model_1 = require("../../models/Subject.model");
const AcademicYear_model_1 = require("../../models/AcademicYear.model");
const Term_model_1 = require("../../models/Term.model");
const Enrollment_model_1 = require("../../models/Enrollment.model");
const ApiResponse_1 = require("../../utils/ApiResponse");
const catchAsync_1 = require("../../utils/catchAsync");
exports.getDashboardStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const [totalStudents, totalTeachers, totalClasses, totalSections, totalSubjects, activeYear, activeTerm] = await Promise.all([
        Student_model_1.Student.countDocuments({ status: true }),
        Teacher_model_1.Teacher.countDocuments({ employmentStatus: 'Active' }),
        Class_model_1.Class.countDocuments({ isActive: true }),
        Section_model_1.Section.countDocuments({ isActive: true }),
        Subject_model_1.Subject.countDocuments({ isActive: true }),
        AcademicYear_model_1.AcademicYear.findOne({ isActive: true }),
        Term_model_1.Term.findOne({ isActive: true })
    ]);
    let activeEnrollments = 0;
    if (activeYear) {
        activeEnrollments = await Enrollment_model_1.Enrollment.countDocuments({ academicYear: activeYear._id, status: 'Active' });
    }
    ApiResponse_1.ApiResponse.success(res, {
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
