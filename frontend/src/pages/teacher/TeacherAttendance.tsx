import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeacherDashboard, getMyStudents, markAttendance, getAttendance } from '@/services/portalService';
import { Badge } from '@/components/common/Badge';

const TeacherAttendance = () => {
  const queryClient = useQueryClient();
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const { data: dashboard } = useQuery({ queryKey: ['teacher-dashboard'], queryFn: getTeacherDashboard });
  const assignments = dashboard?.assignments || [];
  
  // Filter unique class/section combinations
  const validSections = assignments.filter((a: any) => classId === '' || a.class._id === classId);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['teacher-students', classId, sectionId],
    queryFn: () => getMyStudents({ classId, sectionId }),
    enabled: !!classId && !!sectionId
  });

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ['attendance', classId, sectionId, date],
    queryFn: () => getAttendance({ classId, sectionId, date }),
    enabled: !!classId && !!sectionId && !!date
  });

  // Pre-fill state when enrollments or existing attendance changes
  useEffect(() => {
    if (enrollments.length > 0) {
      const newState: Record<string, string> = {};
      enrollments.forEach((e: any) => {
        const existing = existingAttendance.find((a: any) => a.student._id === e.student._id);
        newState[e.student._id] = existing ? existing.status : 'Present'; // Default to Present
      });
      setAttendanceState(newState);
    }
  }, [enrollments, existingAttendance]);

  const saveMutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      setMessage('Attendance saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setTimeout(() => setMessage(''), 3000);
    },
    onError: () => setMessage('Error saving attendance.')
  });

  const handleSave = () => {
    const records = Object.keys(attendanceState).map(studentId => ({
      student: studentId,
      status: attendanceState[studentId]
    }));
    saveMutation.mutate({ classId, sectionId, date, records });
  };

  const setAll = (status: string) => {
    const newState = { ...attendanceState };
    Object.keys(newState).forEach(k => newState[k] = status);
    setAttendanceState(newState);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Attendance</h1>
        {message && <Badge variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Badge>}
      </div>

      <div className="bg-surface rounded-lg border border-border p-4 flex gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Class</label>
          <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }}
            className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent min-w-[150px]">
            <option value="">Select Class...</option>
            {Array.from(new Map(assignments.map((a: any) => [a.class._id, a.class])).values()).map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Section</label>
          <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId}
            className="border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent min-w-[150px] disabled:bg-gray-50">
            <option value="">Select Section...</option>
            {Array.from(new Map(validSections.map((a: any) => [a.section._id, a.section])).values()).map((s: any) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {classId && sectionId ? (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {enrollments.length > 0 ? (
            <>
              <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium">{enrollments.length} Students</span>
                <div className="flex gap-2">
                  <button onClick={() => setAll('Present')} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark All Present</button>
                  <button onClick={() => setAll('Absent')} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Mark All Absent</button>
                </div>
              </div>
              <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                {enrollments.map((e: any) => (
                  <li key={e.student._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {e.student.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-text-primary">{e.student.firstName} {e.student.lastName}</p>
                        <p className="text-xs text-text-secondary">ID: {e.student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                        <button key={status}
                          onClick={() => setAttendanceState(prev => ({ ...prev, [e.student._id]: status }))}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            attendanceState[e.student._id] === status
                              ? status === 'Present' ? 'bg-green-100 border-green-200 text-green-800'
                              : status === 'Absent' ? 'bg-red-100 border-red-200 text-red-800'
                              : status === 'Late' ? 'bg-yellow-100 border-yellow-200 text-yellow-800'
                              : 'bg-blue-100 border-blue-200 text-blue-800'
                              : 'border-border text-text-secondary hover:bg-gray-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t border-border bg-gray-50 flex justify-end">
                <button onClick={handleSave} disabled={saveMutation.isPending} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50">
                  {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-text-secondary">No students found for this class and section.</div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-surface border border-border rounded-lg text-text-secondary">
          Please select a class and section to take attendance.
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;

