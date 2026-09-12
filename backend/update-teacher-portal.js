const fs = require('fs');

const path = './backend/src/modules/portal-teacher/teacherPortal.controller.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import { Teacher }")) {
  code = code.replace(
    "import { Student } from '../../models/Student.model';",
    "import { Student } from '../../models/Student.model';\nimport { Teacher } from '../../models/Teacher.model';"
  );
}

// Update getDashboard
code = code.replace(
  "  const subjects = await Subject.find({ teacher: teacherId, isActive: true }).lean();\n  const subjectNames = subjects.map(s => s.name);",
  "  const teacher = await Teacher.findById(teacherId);\n  if (!teacher) throw ApiError.notFound('Teacher profile not found');\n  const subjectNames = teacher.subjects || [];"
);
code = code.replace("totalSubjects: subjects.length,", "totalSubjects: subjectNames.length,");

// Update other occurrences
const oldGetSubjects = `export const getSubjects = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const subjects = await Subject.find({ teacher: teacherId, isActive: true });
  return ApiResponse.success(res, subjects);
});`;
const newGetSubjects = `export const getSubjects = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw ApiError.notFound('Teacher profile not found');
  const subjects = await Subject.find({ name: { $in: teacher.subjects || [] }, isActive: true });
  return ApiResponse.success(res, subjects);
});`;
if (code.includes('const subjects = await Subject.find({ teacher: teacherId, isActive: true });')) {
  code = code.replace(oldGetSubjects, newGetSubjects);
}

fs.writeFileSync(path, code);
console.log('Updated teacherPortal.controller.ts');