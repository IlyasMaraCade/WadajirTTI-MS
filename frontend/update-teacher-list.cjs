const fs = require('fs');

const path = './frontend/src/pages/super-admin/teachers/TeacherList.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update Teacher interface
code = code.replace(
  "  subjects: string[];\n  employmentStatus: string;\n}",
  "  subjects: string[];\n  time?: string;\n  credentials?: string;\n  employmentStatus: string;\n}"
);

// 2. Update defaultForm
code = code.replace(
  "  subjects: [] as string[],\n  username: '', password: ''\n};",
  "  subjects: [] as string[],\n  time: '', credentials: '',\n  username: '', password: ''\n};"
);

// 3. Remove AVAILABLE_COURSES
code = code.replace(
  "const AVAILABLE_COURSES = ['Cilaan', 'Makeup', 'Ubax Sameyn', 'English', 'Somali', 'Xisaab', 'Harqaan', 'Crochet', 'Computer'];",
  ""
);

// 4. In openEdit
code = code.replace(
  "setForm({ teacherId: t.teacherId, fullName: t.fullName, phone: t.phone, subjects: t.subjects || [], username: '', password: '' });",
  "setForm({ teacherId: t.teacherId, fullName: t.fullName, phone: t.phone, subjects: t.subjects || [], time: t.time || '', credentials: t.credentials || '', username: '', password: '' });"
);

// 5. Replace Subjects UI
const oldSubjectBlock = `<div>
              <label className="block text-sm font-medium text-text-primary mb-2">Subjects They Teach</label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_COURSES.map(course => {
                  const isSelected = form.subjects.includes(course);
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        subjects: isSelected
                          ? f.subjects.filter(s => s !== course)
                          : [...f.subjects, course]
                      }))}
                      className={\`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all \${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }\`}
                    >
                      {course}
                    </button>
                  );
                })}
              </div>
            </div>`;
            
const newSubjectBlock = `<div>
              <label className="block text-sm font-medium text-text-primary mb-1">Subject They Teach *</label>
              <input 
                required 
                value={form.subjects.join(', ')} 
                onChange={e => setForm(f => ({ ...f, subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                placeholder="e.g. Mathematics" 
                className="w-full border border-border rounded px-3 py-2 text-sm" 
              />
              <p className="text-xs text-gray-500 mt-1">For multiple subjects, separate with commas (e.g. Math, Science)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Teaching Time / Schedule</label>
                <input 
                  value={form.time} 
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  placeholder="e.g. Morning Shift" 
                  className="w-full border border-border rounded px-3 py-2 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Credentials</label>
                <input 
                  value={form.credentials} 
                  onChange={e => setForm(f => ({ ...f, credentials: e.target.value }))}
                  placeholder="e.g. B.Sc. Mathematics" 
                  className="w-full border border-border rounded px-3 py-2 text-sm" 
                />
              </div>
            </div>`;

code = code.replace(oldSubjectBlock, newSubjectBlock);

fs.writeFileSync(path, code);
console.log('Updated TeacherList.tsx');