const fs = require('fs');
const files = [
  'frontend/src/pages/principal/PrincipalDashboard.tsx',
  'frontend/src/pages/super-admin/students/StudentList.tsx',
  'frontend/src/pages/super-admin/teachers/TeacherList.tsx'
];

const replacements = {
  'bg-white': 'bg-white dark:bg-neutral-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-neutral-800/50',
  'bg-slate-50': 'bg-slate-50 dark:bg-neutral-800/50',
  'bg-slate-100': 'bg-slate-100 dark:bg-neutral-800',
  'border-gray-200': 'border-gray-200 dark:border-neutral-800',
  'border-gray-300': 'border-gray-300 dark:border-neutral-700',
  'border-slate-100': 'border-slate-100 dark:border-neutral-800',
  'border-slate-200': 'border-slate-200 dark:border-neutral-800',
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-gray-800': 'text-gray-800 dark:text-neutral-100',
  'text-gray-700': 'text-gray-700 dark:text-neutral-300',
  'text-gray-600': 'text-gray-600 dark:text-neutral-400',
  'text-gray-500': 'text-gray-500 dark:text-neutral-500',
  'text-slate-700': 'text-slate-700 dark:text-neutral-200',
  'text-slate-600': 'text-slate-600 dark:text-neutral-400',
  'text-slate-500': 'text-slate-500 dark:text-neutral-500',
  'bg-blue-50/50': 'bg-blue-50/50 dark:bg-blue-900/20',
  'border-blue-100': 'border-blue-100 dark:border-blue-900/50',
  'hover:bg-blue-100': 'hover:bg-blue-100 dark:hover:bg-blue-900/40',
  'bg-emerald-50/50': 'bg-emerald-50/50 dark:bg-emerald-900/20',
  'border-emerald-100': 'border-emerald-100 dark:border-emerald-900/50',
  'hover:bg-emerald-100': 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  'bg-rose-50/50': 'bg-rose-50/50 dark:bg-rose-900/20',
  'border-rose-100': 'border-rose-100 dark:border-rose-900/50',
  'hover:bg-rose-100': 'hover:bg-rose-100 dark:hover:bg-rose-900/40',
  'bg-teal-50/50': 'bg-teal-50/50 dark:bg-teal-900/20',
  'border-teal-100': 'border-teal-100 dark:border-teal-900/50',
  'hover:bg-teal-100': 'hover:bg-teal-100 dark:hover:bg-teal-900/40',
  'bg-purple-50/50': 'bg-purple-50/50 dark:bg-purple-900/20',
  'border-purple-100': 'border-purple-100 dark:border-purple-900/50',
  'hover:bg-purple-100': 'hover:bg-purple-100 dark:hover:bg-purple-900/40',
  'bg-indigo-50/50': 'bg-indigo-50/50 dark:bg-indigo-900/20',
  'border-indigo-100': 'border-indigo-100 dark:border-indigo-900/50',
  'hover:bg-indigo-100': 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
  'bg-indigo-50': 'bg-indigo-50 dark:bg-indigo-900/20',
  'bg-blue-50': 'bg-blue-50 dark:bg-blue-900/20',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-900/20',
  'bg-amber-50': 'bg-amber-50 dark:bg-amber-900/20',
  'bg-rose-50': 'bg-rose-50 dark:bg-rose-900/20'
};

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Quick trick to avoid replacing already replaced strings:
    // e.g. if we have bg-white dark:bg-neutral-900, we don't want to replace bg-white again.
    // So we first do a pass to clean up existing ones if we run it multiple times.
    Object.values(replacements).forEach(darkClass => {
      content = content.split(darkClass).join(Object.keys(replacements).find(k => replacements[k] === darkClass));
    });

    // Now do the replacement but ensure word boundaries so bg-gray-500 doesn't match bg-gray-50
    Object.keys(replacements).forEach(key => {
      // Create a regex that matches the exact tailwind class
      // \b doesn't always work perfectly for hyphens, so we match whitespace/quotes around it
      // Let's use a simpler replace strategy: just string replace. Since tailwind classes are unique enough,
      // but to be safe we pad with space/quote check
      
      const regex = new RegExp(\( |'|"|\)\( |'|"|\)\, 'g');
      content = content.replace(regex, \\\\\);
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + file);
  } else {
    console.log('Not found: ' + file);
  }
});
