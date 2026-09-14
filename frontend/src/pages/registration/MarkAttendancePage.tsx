import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Check, Users } from 'lucide-react';

interface Student {
  _id: string;
  fullName: string;
  studentId: string;
  courses?: string[];
  status: boolean;
}

interface AttendanceRecord {
  student: string | { _id: string };
  status: string;
}

interface Subject {
  _id: string;
  name: string;
}

const EMPTY_ARRAY: any[] = [];

const MarkAttendancePage = () => {
  const queryClient = useQueryClient();
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState('');

  const { data: systemSubjects = EMPTY_ARRAY } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => { const res = await apiClient.get('/subjects'); return res.data?.data || []; },
  });

  useEffect(() => {
    if (systemSubjects.length > 0 && !subjectId) {
      setSubjectId(systemSubjects[0]._id);
      setSubjectName(systemSubjects[0].name);
    }
  }, [systemSubjects.length]);

  const { data: allStudents = EMPTY_ARRAY, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['active-students'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return (res.data?.data || []).filter((s: Student) => s.status === true);
    },
  });

  const students = React.useMemo(() => allStudents.filter(s => s.courses?.includes(subjectName) || s.courses?.includes(subjectId)), [allStudents, subjectName, subjectId]);

  const { data: existingAttendance = EMPTY_ARRAY, isLoading: loadingAttendance } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance-by-date', subjectName, date],
    queryFn: async () => {
      if (!subjectName || !date) return [];
      const res = await apiClient.get('/principal/attendance/by-date', { params: { subjectName, date } });
      return res.data?.data || [];
    },
    enabled: !!subjectName && !!date,
  });

  // Reset attendance state to 'Present' for all students whenever subject or date changes
  const lastLoadedRef = React.useRef({ subjectName: '', date: '', timestamp: 0 });

  useEffect(() => {
    if (students.length === 0) return;
    
    // Only reset if subject/date changed, or if existingAttendance actually loaded new data (tracked by loading state change)
    // We avoid resetting if the user is just clicking buttons and triggering re-renders
    const currentKey = subjectName + date;
    const lastKey = lastLoadedRef.current.subjectName + lastLoadedRef.current.date;
    
    // Only update if we switched subject/date, or if we haven't loaded this data yet
    if (currentKey !== lastKey || lastLoadedRef.current.timestamp < Date.now() - 2000) {
      if (!loadingAttendance) {
        const newState: Record<string, string> = {};
        students.forEach((s) => {
          const existing = existingAttendance.find((a) => {
            const sid = typeof a.student === 'object' ? a.student._id : a.student;
            return sid === s._id;
          });
          newState[s._id] = existing ? existing.status : 'Present';
        });
        setAttendanceState(newState);
        lastLoadedRef.current = { subjectName, date, timestamp: Date.now() };
      }
    }
  }, [students, existingAttendance, subjectName, date, loadingAttendance]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const records = Object.keys(attendanceState).map(sid => ({ studentId: sid, status: attendanceState[sid] }));
      return apiClient.post('/principal/attendance/mark', { subjectName, date, records });
    },
    onSuccess: () => {
      setSaveMsg('Attendance saved!');
      queryClient.invalidateQueries({ queryKey: ['attendance-by-date'] });
      setTimeout(() => setSaveMsg(''), 3000);
    },
    onError: () => { setSaveMsg('Error saving.'); setTimeout(() => setSaveMsg(''), 3000); },
  });

  const setAll = (status: string) => {
    const newState: Record<string, string> = {};
    students.forEach(s => { newState[s._id] = status; });
    setAttendanceState(newState);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = systemSubjects.find(s => s._id === e.target.value);
    if (selected) {
      setSubjectId(selected._id);
      setSubjectName(selected.name);
    }
  };

  const counts = {
    Present: Object.values(attendanceState).filter(v => v === 'Present').length,
    Absent: Object.values(attendanceState).filter(v => v === 'Absent').length,
    Late: Object.values(attendanceState).filter(v => v === 'Late').length,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-black text-text-primary mb-1">Mark Attendance</h1>
        <p className="text-text-secondary text-sm">Select a subject and date, then mark each student.</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 flex flex-wrap gap-4 items-end shadow-sm">
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wide">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wide">Subject</label>
          <select value={subjectId} onChange={handleSubjectChange}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent min-w-[200px] cursor-pointer">
            {systemSubjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        {subjectName && (
          <div className="text-xs text-text-muted font-semibold bg-slate-50 border border-border px-3 py-2 rounded-lg">
            Marking for: <span className="text-text-primary font-bold">{subjectName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', count: counts.Present, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
          { label: 'Absent', count: counts.Absent, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
          { label: 'Late', count: counts.Late, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
        ].map(item => (
          <div key={item.label} className={`${item.bg} border ${item.border} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-black ${item.text}`}>{item.count}</p>
            <p className={`text-xs font-bold ${item.text}`}>{item.label}</p>
          </div>
        ))}
      </div>

      {loadingStudents || loadingAttendance ? <LoadingSpinner /> : (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center flex-wrap gap-3">
            <span className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Users className="w-4 h-4" /> {students.length} Students
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setAll('Present')} className="btn-hover cursor-pointer text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 font-bold">✓ All Present</button>
              <button type="button" onClick={() => setAll('Absent')} className="btn-hover cursor-pointer text-xs px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 font-bold">✗ All Absent</button>
            </div>
          </div>

          <ul className="divide-y divide-border max-h-[55vh] overflow-y-auto">
            {students.map((student) => (
              <li key={student._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/50 gap-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black shrink-0">
                    {student.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-text-primary">{student.fullName}</p>
                    <p className="text-xs text-text-secondary">ID: {student.studentId}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {(['Present', 'Absent', 'Late'] as const).map(status => (
                    <button type="button" key={status}
                      onClick={() => setAttendanceState(prev => ({ ...prev, [student._id]: status }))}
                      className={`btn-hover cursor-pointer px-3 py-1.5 text-xs rounded-full border font-bold transition-all ${
                        attendanceState[student._id] === status
                          ? status === 'Present' ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : status === 'Absent' ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'border-border text-text-secondary hover:bg-slate-100'
                      }`}>
                      {status}
                    </button>
                  ))}
                </div>
              </li>
            ))}
            {students.length === 0 && (
              <li className="p-8 text-center text-text-secondary text-sm">No active students found.</li>
            )}
          </ul>

          <div className="p-4 border-t border-border bg-slate-50 flex justify-between items-center">
            {saveMsg ? (
              <span className={`text-sm font-bold flex items-center gap-1 ${saveMsg.includes('Error') ? 'text-rose-600' : 'text-emerald-600'}`}>
                <Check className="w-4 h-4" /> {saveMsg}
              </span>
            ) : <span />}
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !subjectName}
              className="btn-hover cursor-pointer px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary-600 disabled:opacity-50 shadow-sm">
              {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
