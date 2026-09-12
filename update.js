const fs = require('fs');

// ===== FIX 1: Payments.tsx - auto-fill fee when student selected =====
let paymentsPath = './frontend/src/pages/finance/Payments.tsx';
let payments = fs.readFileSync(paymentsPath, 'utf8');

// Fix student onChange to auto-populate fee amount based on selected payment type
const oldStudentOnChange = `const sel = studentsData?.find((s: any) => s._id === e.target.value);
          setPayForm(f => ({...f, studentId: e.target.value, studentName: sel?.fullName || ''}));`;
const newStudentOnChange = `const sel = studentsData?.find((s: any) => s._id === e.target.value);
          const currentDesc = payForm.description;
          const autoAmt = currentDesc === 'Registration Fee' ? sel?.registrationFee : sel?.fee;
          setPayForm(f => ({...f, studentId: e.target.value, studentName: sel?.fullName || '', amount: autoAmt?.toString() || ''}));`;

if (payments.includes(oldStudentOnChange)) {
  payments = payments.replace(oldStudentOnChange, newStudentOnChange);
  console.log('Fixed student onChange in Payments.tsx');
} else {
  console.error('ERROR: student onChange target not found');
  console.log(payments.substring(payments.indexOf('studentId: e.target.value') - 100, payments.indexOf('studentId: e.target.value') + 200));
}

fs.writeFileSync(paymentsPath, payments);

// ===== FIX 2: StudentList.tsx - add time and sort filters =====
let slPath = './frontend/src/pages/super-admin/students/StudentList.tsx';
let sl = fs.readFileSync(slPath, 'utf8');

// Add time to Student interface
if (!sl.includes('time?: string;')) {
  sl = sl.replace('status: boolean;', 'status: boolean;\n  time?: string;');
  console.log('Added time to Student interface');
}

// Add time to emptyForm
if (!sl.includes("time: \"\",")) {
  sl = sl.replace("courses: [] as string[],", "courses: [] as string[],\n    time: \"\",");
  console.log('Added time to emptyForm');
}

// Add time when opening edit
if (!sl.includes("time: s.time || '',")) {
  sl = sl.replace(
    "courses: s.courses && s.courses.length > 0 ? s.courses : ['Computer'],",
    "courses: s.courses && s.courses.length > 0 ? s.courses : ['Computer'],\n        time: s.time || '',"
  );
  console.log('Added time to edit form');
}

// Add sort/filter states
if (!sl.includes('const [timeFilter, setTimeFilter]')) {
  sl = sl.replace(
    "const [courseFilter, setCourseFilter] = useState('ALL');",
    "const [courseFilter, setCourseFilter] = useState('ALL');\n  const [timeFilter, setTimeFilter] = useState('ALL');\n  const [sortField, setSortField] = useState('createdAt');\n  const [sortOrder, setSortOrder] = useState('desc');"
  );
  console.log('Added sort/filter states');
}

// Update queryKey
if (!sl.includes('timeFilter, sortField, sortOrder]')) {
  sl = sl.replace(
    "queryKey: ['students', page, search, statusFilter, courseFilter],",
    "queryKey: ['students', page, search, statusFilter, courseFilter, timeFilter, sortField, sortOrder],"
  );
  console.log('Updated queryKey');
}

// Add sort/time filter logic
if (!sl.includes('if (timeFilter !== ')) {
  sl = sl.replace(
    "if (courseFilter !== 'ALL') students = students.filter((s: any) => s.courses?.includes(courseFilter));",
    `if (courseFilter !== 'ALL') students = students.filter((s: any) => s.courses?.includes(courseFilter));
  if (timeFilter !== 'ALL') students = students.filter((s: any) => s.time === timeFilter);
  students = students.sort((a: any, b: any) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];
    if (sortField === 'courses') { valA = a.courses?.[0] || ''; valB = b.courses?.[0] || ''; }
    if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = (valB || '').toLowerCase(); }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });`
  );
  console.log('Added sort/time filter logic');
}

// Add time column to table
if (!sl.includes("accessorKey: 'time', header: 'Time'")) {
  sl = sl.replace(
    "{ accessorKey: 'phone', header: 'Student Phone', cell: ({ getValue }) => getValue() || '—' },",
    "{ accessorKey: 'phone', header: 'Student Phone', cell: ({ getValue }) => getValue() || '—' },\n    { accessorKey: 'time', header: 'Time', cell: ({ getValue }) => (getValue() as string) || '—' },"
  );
  console.log('Added time column');
}

// Update flex container to wrap
if (!sl.includes('flex flex-wrap gap-3')) {
  sl = sl.replace('<div className="flex gap-3">', '<div className="flex flex-wrap gap-3">');
  console.log('Updated flex container');
}

// Add time/sort filter controls after existing status/course selects
const courseSelectEnd = `{AVAILABLE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>`;
const timeAndSortControls = `{AVAILABLE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
          <option value="ALL">All Times</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
        <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
          <option value="createdAt">Sort: Date Added</option>
          <option value="fullName">Sort: Name</option>
          <option value="courses">Sort: Course</option>
        </select>
        <button type="button" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm font-medium whitespace-nowrap">
          {sortOrder === 'asc' ? 'A → Z ↑' : 'Z → A ↓'}
        </button>`;

if (!sl.includes("setTimeFilter(e.target.value)")) {
  if (sl.includes(courseSelectEnd)) {
    sl = sl.replace(courseSelectEnd, timeAndSortControls);
    console.log('Added time/sort controls to filter bar');
  } else {
    console.error('ERROR: course select end not found');
  }
}

// Add time field to registration form (before course selection)
if (!sl.includes('Time / Shift')) {
  sl = sl.replace(
    '{/* Course Selection Dropdown / Multi-Select */}',
    `{/* Time Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Time / Shift</label>
            <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary">
              <option value="">-- Select Time --</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          {/* Course Selection Dropdown / Multi-Select */}`
  );
  console.log('Added time field to registration form');
}

fs.writeFileSync(slPath, sl);
console.log('\nAll changes applied successfully!');