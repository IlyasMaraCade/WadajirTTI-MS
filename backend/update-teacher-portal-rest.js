const fs = require('fs');

const path = './backend/src/modules/portal-teacher/teacherPortal.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const replacement = `// --- Students (Strictly Exclude Fee Info for Teachers) ---
export const getMyStudents = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { subjectId } = req.query; // this is the subject string name or _id

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw ApiError.notFound('Teacher profile not found');
  
  // Find which subjects to filter by
  let subjectNames = teacher.subjects || [];
  if (subjectId) {
    // If frontend passed an ID, we look up the name. If it passed a name, use it.
    let targetName = String(subjectId);
    if (subjectId.toString().length === 24) {
       const s = await Subject.findById(subjectId);
       if (s) targetName = s.name;
    }
    if (subjectNames.includes(targetName)) {
      subjectNames = [targetName];
    } else {
      return ApiResponse.success(res, [], 'Unauthorized subject');
    }
  }

  if (subjectNames.length === 0) {
    return ApiResponse.success(res, [], 'No students found (unauthorized or no subjects)');
  }

  const students = await Student.find({
    courses: { $in: subjectNames },
    enrollmentStatus: 'Active',
    status: true,
  }).select('studentId fullName gender phone parentPhone courses enrollmentStatus status time');

  return ApiResponse.success(res, students, 'Students fetched');
});

// --- Attendance ---
export const markAttendance = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  let { subjectId, date, records } = req.body;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw ApiError.notFound('Teacher profile not found');

  // Convert subjectId (which could be ID or name) to the actual subject name and document
  let subjectName = String(subjectId);
  let subjectDoc = null;
  if (subjectId.toString().length === 24) {
    subjectDoc = await Subject.findById(subjectId);
    if (subjectDoc) subjectName = subjectDoc.name;
  } else {
    subjectDoc = await Subject.findOne({ name: subjectName });
  }

  if (!teacher.subjects?.includes(subjectName) || !subjectDoc) {
    throw new ApiError(403, 'Not authorized to take attendance for this subject');
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const operations = records.map((record: any) => ({
    updateOne: {
      filter: {
        student: record.studentId,
        subject: subjectDoc._id,
        date: attendanceDate,
      },
      update: {
        $set: {
          status: record.status,
          recordedBy: teacherId,
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await Attendance.bulkWrite(operations);
  }

  return ApiResponse.success(res, null, 'Attendance marked successfully');
});

export const getAttendance = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { subjectId, date } = req.query;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw ApiError.notFound('Teacher profile not found');

  let subjectName = String(subjectId);
  let subjectDoc = null;
  if (subjectId && subjectId.toString().length === 24) {
    subjectDoc = await Subject.findById(subjectId);
    if (subjectDoc) subjectName = subjectDoc.name;
  } else {
    subjectDoc = await Subject.findOne({ name: subjectName });
  }

  if (!teacher.subjects?.includes(subjectName) || !subjectDoc) {
    throw new ApiError(403, 'Not authorized to view attendance for this subject');
  }

  const queryDate = new Date(date as string);
  queryDate.setHours(0, 0, 0, 0);

  const attendanceRecords = await Attendance.find({
    subject: subjectDoc._id,
    date: queryDate,
  }).populate('student', 'studentId fullName');

  return ApiResponse.success(res, attendanceRecords, 'Attendance fetched');
});

export const createExam = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { name, type, date, maxMarks, subject: subjectId } = req.body;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw ApiError.notFound('Teacher profile not found');

  let subjectName = String(subjectId);
  let subjectDoc = null;
  if (subjectId.toString().length === 24) {
    subjectDoc = await Subject.findById(subjectId);
    if (subjectDoc) subjectName = subjectDoc.name;
  } else {
    subjectDoc = await Subject.findOne({ name: subjectName });
  }

  if (!teacher.subjects?.includes(subjectName) || !subjectDoc) {
    throw new ApiError(403, 'Not authorized for this subject');
  }

  const exam = await Exam.create({
    name,
    type,
    maxMarks,
    subject: subjectDoc._id,
    createdBy: teacherId,
  });

  return ApiResponse.success(res, exam, 'Exam created');
});`;

code = code.replace(
  /\/\/ --- Students.*?(?=export const getExams)/s,
  replacement + "\n\n"
);

const assignmentReplacement = `// --- Assignments ---
export const createAssignment = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.teacherId;
  const { title, description, dueDate, subject: subjectId } = req.body;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw ApiError.notFound('Teacher profile not found');

  let subjectName = String(subjectId);
  let subjectDoc = null;
  if (subjectId.toString().length === 24) {
    subjectDoc = await Subject.findById(subjectId);
    if (subjectDoc) subjectName = subjectDoc.name;
  } else {
    subjectDoc = await Subject.findOne({ name: subjectName });
  }

  if (!teacher.subjects?.includes(subjectName) || !subjectDoc) {
    throw new ApiError(403, 'Not authorized');
  }

  const assignment = await Assignment.create({
    title,
    description,
    dueDate,
    subject: subjectDoc._id,
    createdBy: teacherId,
  });

  return ApiResponse.success(res, assignment, 'Assignment created');
});`;

code = code.replace(
  /\/\/ --- Assignments ---.*?(?=export const getAssignments)/s,
  assignmentReplacement + "\n\n"
);

fs.writeFileSync(path, code);
console.log('Updated teacherPortal methods.');