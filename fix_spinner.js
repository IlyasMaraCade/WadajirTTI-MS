const fs = require('fs');
let s = fs.readFileSync('frontend/src/pages/principal/EnterMarksPage.tsx', 'utf8');
s = s.replace(/<LoadingSpinner size="sm" \/>/g, '<LoadingSpinner />');
fs.writeFileSync('frontend/src/pages/principal/EnterMarksPage.tsx', s, 'utf8');
