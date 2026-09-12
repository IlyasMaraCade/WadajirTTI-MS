const fs = require('fs');

const ctrlPath = './backend/src/modules/teachers/teacher.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

// Add Subject import if missing
if (!ctrl.includes('Subject.model')) {
  ctrl = ctrl.replace(
    "import { Teacher } from '../../models/Teacher.model';",
    "import { Teacher } from '../../models/Teacher.model';\nimport { Subject } from '../../models/Subject.model';"
  );
}

// In createTeacher:
const createSavePoint = `    const teacher = new Teacher({
      teacherId,
      ...rest,
      user: userId,
    });
    
    await teacher.save({ session });`;

const createReplacement = `    const teacher = new Teacher({
      teacherId,
      ...rest,
      user: userId,
    });
    
    await teacher.save({ session });
    
    // Automatically upsert subjects
    if (rest.subjects && Array.isArray(rest.subjects)) {
      for (const subjectName of rest.subjects) {
        if (subjectName.trim()) {
          await Subject.findOneAndUpdate(
            { name: subjectName.trim() },
            { $setOnInsert: { name: subjectName.trim(), isActive: true } },
            { upsert: true, session }
          );
        }
      }
    }`;

if (ctrl.includes(createSavePoint) && !ctrl.includes('Automatically upsert subjects')) {
  ctrl = ctrl.replace(createSavePoint, createReplacement);
  console.log("Updated createTeacher");
}

// In updateTeacher:
const updatePoint = `  export const updateTeacher = catchAsync(async (req: Request, res: Response) => {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!teacher) throw ApiError.notFound('Teacher not found');
    ApiResponse.success(res, teacher);
  });`;

const updateReplacement = `  export const updateTeacher = catchAsync(async (req: Request, res: Response) => {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!teacher) throw ApiError.notFound('Teacher not found');
    
    // Automatically upsert subjects
    if (req.body.subjects && Array.isArray(req.body.subjects)) {
      for (const subjectName of req.body.subjects) {
        if (subjectName.trim()) {
          await Subject.findOneAndUpdate(
            { name: subjectName.trim() },
            { $setOnInsert: { name: subjectName.trim(), isActive: true } },
            { upsert: true }
          );
        }
      }
    }
    
    ApiResponse.success(res, teacher);
  });`;

if (ctrl.includes(updatePoint)) {
  ctrl = ctrl.replace(updatePoint, updateReplacement);
  console.log("Updated updateTeacher");
}

fs.writeFileSync(ctrlPath, ctrl);