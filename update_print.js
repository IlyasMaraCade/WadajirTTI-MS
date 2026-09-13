const fs = require('fs');

const files = [
  'frontend/src/pages/principal/PrincipalExams.tsx',
  'frontend/src/pages/super-admin/attendance/AttendanceView.tsx',
  'frontend/src/pages/super-admin/marks/ExamMarksView.tsx',
  'frontend/src/pages/super-admin/reports/FinanceReports.tsx',
  'frontend/src/pages/super-admin/reports/PerformanceReports.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('import { printElement }')) {
    content = content.replace('import React', "import { printElement } from '@/utils/printUtils';\nimport React");
  }

  content = content.replace(/window\.print\(\);/g, "printElement('printable-area', 'Official Report');");
  
  // Wrap DataTable if not already wrapped
  if (!content.includes('id="printable-area"')) {
    content = content.replace(/<DataTable([^>]*)\/>/s, '<div id="printable-area">\n          <DataTable/>\n        </div>');
  }

  fs.writeFileSync(file, content);
}
console.log("Files updated successfully.");
