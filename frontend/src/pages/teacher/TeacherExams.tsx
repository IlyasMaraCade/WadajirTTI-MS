import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyExams, createExam, enterMarks, getTeacherDashboard, getMyStudents } from '@/services/portalService';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';

const TeacherExams = () => {
  const queryClient = useQueryClient();
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examForm, setExamForm] = useState({ name: '', type: 'Midterm', date: '', maxMarks: 100, class: '', section: '', subject: '' });
  const [marksState, setMarksState] = useState<Record<string, { score: number, remarks: string }>>({});
  const [error, setError] = useState('');

  const { data: dashboard } = useQuery({ queryKey: ['teacher-dashboard'], queryFn: getTeacherDashboard });
  const assignments = dashboard?.assignments || [];

  const { data: exams = [], isLoading } = useQuery({ queryKey: ['teacher-exams'], queryFn: getMyExams });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['teacher-students', selectedExam?.class?._id, selectedExam?.section?._id],
    queryFn: () => getMyStudents({ classId: selectedExam?.class?._id, sectionId: selectedExam?.section?._id }),
    enabled: !!selectedExam
  });

  const createExamMutation = useMutation({
    mutationFn: createExam,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['teacher-exams'] }); setIsExamModalOpen(false); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to create exam')
  });

  const saveMarksMutation = useMutation({
    mutationFn: enterMarks,
    onSuccess: () => { setIsMarksModalOpen(false); alert('Marks saved!'); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to save marks')
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    createExamMutation.mutate(examForm);
  };

  const openMarks = (exam: any) => {
    setSelectedExam(exam);
    setMarksState({}); // Reset state; in a full app we'd fetch existing marks here
    setError('');
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = () => {
    const records = Object.keys(marksState).map(studentId => ({
      student: studentId,
      score: marksState[studentId].score,
      remarks: marksState[studentId].remarks
    }));
    saveMarksMutation.mutate({ examId: selectedExam._id, records });
  };

  const columns = [
    { accessorKey: 'name', header: 'Exam Name' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'class.name', header: 'Class' },
    { accessorKey: 'subject.name', header: 'Subject' },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }: any) => new Date(getValue()).toLocaleDateString() },
    { accessorKey: 'maxMarks', header: 'Max Marks' },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }: any) => (
        <button onClick={() => openMarks(row.original)} className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-600">Enter Marks</button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Exams & Marks</h1>
        <button onClick={() => { setExamForm({ ...examForm, class: assignments[0]?.class?._id || '' }); setIsExamModalOpen(true); setError(''); }} 
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600">
          + Schedule Exam
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={exams} columns={columns} isLoading={isLoading} emptyMessage="No exams found." />
      </div>

      {/* Create Exam Modal */}
      <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Schedule Exam">
        <form onSubmit={handleCreateExam} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Exam Name *</label>
            <input required value={examForm.name} onChange={e => setExamForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select value={examForm.type} onChange={e => setExamForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                {['Quiz', 'Midterm', 'Final', 'Practical', 'Assignment'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input required type="date" value={examForm.date} onChange={e => setExamForm(f => ({ ...f, date: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium mb-1">Assignment Scope *</label>
              <select required value={`${examForm.class}|${examForm.section}|${examForm.subject}`} 
                onChange={e => {
                  const [c, sec, sub] = e.target.value.split('|');
                  setExamForm(f => ({ ...f, class: c, section: sec, subject: sub }));
                }} className="w-full border rounded px-3 py-2 text-sm">
                <option value="">Select Assignment...</option>
                {assignments.map((a: any) => (
                  <option key={a._id} value={`${a.class._id}|${a.section._id}|${a.subject._id}`}>
                    {a.class.name} {a.section.name} - {a.subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Marks *</label>
              <input required type="number" value={examForm.maxMarks} onChange={e => setExamForm(f => ({ ...f, maxMarks: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={createExamMutation.isPending} className="px-4 py-2 bg-primary text-white rounded text-sm disabled:opacity-50">Save</button>
          </div>
        </form>
      </Modal>

      {/* Enter Marks Modal */}
      <Modal isOpen={isMarksModalOpen} onClose={() => setIsMarksModalOpen(false)} title={`Enter Marks - ${selectedExam?.name}`} size="xl">
        <div className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
          <div className="bg-blue-50 p-3 rounded flex justify-between text-sm text-blue-800">
            <span>Subject: <strong>{selectedExam?.subject?.name}</strong></span>
            <span>Max Marks: <strong>{selectedExam?.maxMarks}</strong></span>
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto divide-y">
            {enrollments.map((e: any) => (
              <div key={e.student._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{e.student.firstName} {e.student.lastName}</p>
                  <p className="text-xs text-text-secondary">{e.student.studentId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" max={selectedExam?.maxMarks} min={0} placeholder="Score"
                    value={marksState[e.student._id]?.score ?? ''}
                    onChange={evt => setMarksState(s => ({ ...s, [e.student._id]: { ...s[e.student._id], score: Number(evt.target.value) } }))}
                    className="w-20 border rounded px-2 py-1 text-sm text-center focus:border-accent" />
                  <input type="text" placeholder="Remarks"
                    value={marksState[e.student._id]?.remarks ?? ''}
                    onChange={evt => setMarksState(s => ({ ...s, [e.student._id]: { ...s[e.student._id], remarks: evt.target.value } }))}
                    className="w-40 border rounded px-2 py-1 text-sm focus:border-accent" />
                </div>
              </div>
            ))}
            {enrollments.length === 0 && <p className="text-sm text-text-secondary py-4 text-center">No students found.</p>}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button onClick={handleSaveMarks} disabled={saveMarksMutation.isPending} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50">
              {saveMarksMutation.isPending ? 'Saving...' : 'Submit Marks'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherExams;

