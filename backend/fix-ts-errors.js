const fs = require('fs');

const path = './backend/src/modules/portal-teacher/teacherPortal.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// Fix Line 53
code = code.replace(
  "assignments: subjects.map(s => ({ subject: s })), // map for frontend compat",
  "assignments: subjectNames.map((s: string) => ({ subject: { name: s } })), // map for frontend compat"
);

// Define getGrade at the top if not present
if (!code.includes('const getGrade =')) {
  code = code.replace(
    '// --- Dashboard & Overviews ---',
    `const getGrade = (score: number, max: number) => {\n  const p = (score / max) * 100;\n  if (p >= 90) return 'A+';\n  if (p >= 80) return 'A';\n  if (p >= 70) return 'B';\n  if (p >= 60) return 'C';\n  if (p >= 50) return 'D';\n  return 'F';\n};\n\n// --- Dashboard & Overviews ---`
  );
}

fs.writeFileSync(path, code);
console.log('Fixed TS errors.');