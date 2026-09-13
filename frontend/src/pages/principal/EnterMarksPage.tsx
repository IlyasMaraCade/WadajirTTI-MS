import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const getGrade = (score: number | undefined, maxMarks: number) => {
  if (score === undefined || score === null) return '-';
  const percentage = (score / maxMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

const EnterMarksPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [marksState, setMarksState] = useState<Record<string, { score?: number, remarks: string }>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});

  // Fetch all exams to find the current one
  const { data: exams, isLoading: loadingExams } = useQuery({
    queryKey: ['principal-all-exams'],
    queryFn: async () => {
      const res = await apiClient.get('/principal/exams');
      return res.data?.data || [];
    },
  });

  const selectedExam = exams?.find((e: any) => e._id === examId);

  // Fetch students
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['active-students'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return (res.data?.data || []).filter((s: any) => s.status === true);
    },
  });

  // Fetch existing marks for this exam to populate initial state
  const { data: existingMarks } = useQuery({
    queryKey: ['admin-marks'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/marks');
      return res.data?.data || [];
    },
  });

  useEffect(() => {
    if (students && existingMarks && selectedExam) {
      const examMarks = existingMarks.filter((m: any) => m.exam?._id === selectedExam._id);
      const initialState: any = {};
      examMarks.forEach((m: any) => {
        if (m.student && m.student._id) {
          initialState[m.student._id] = { score: m.score, remarks: m.remarks || '' };
        }
      });
      setMarksState(initialState);
    }
  }, [students, existingMarks, selectedExam]);

  const handleBlur = async (studentId: string) => {
    const data = marksState[studentId];
    if (data?.score === undefined || data.score === null || data.score.toString() === '') return;

    if (data.score > selectedExam.maxMarks) {
      alert(`Score cannot exceed ${selectedExam.maxMarks}`);
      return;
    }

    setSaveStatus(prev => ({ ...prev, [studentId]: 'saving' }));
    try {
      await apiClient.post('/principal/exams/marks', {
        examId: selectedExam._id,
        records: [{ student: studentId, score: data.score, remarks: data.remarks }]
      });
      setSaveStatus(prev => ({ ...prev, [studentId]: 'saved' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [studentId]: undefined as any }));
      }, 2000);
    } catch (error) {
      console.error(error);
      setSaveStatus(prev => ({ ...prev, [studentId]: 'error' }));
    }
  };

  if (loadingExams || loadingStudents) return <LoadingSpinner />;
  if (!selectedExam) return <div className="p-8 text-center text-red-500">Exam not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </button>

      <div>
        <h1 className="text-2xl font-black text-text-primary mb-2">Enter Marks</h1>
        <p className="text-text-muted text-sm">
          Auto-saves when you click outside the input box.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-wrap justify-between items-center text-blue-900 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Exam</p>
          <p className="font-bold">{selectedExam.name}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Subject</p>
          <p className="font-bold">{selectedExam.subject?.name || selectedExam.subjectName}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Max Marks</p>
          <p className="font-bold text-lg">{selectedExam.maxMarks}</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-text-secondary">Student ID</th>
                <th className="px-6 py-4 font-bold text-text-secondary">Student Name</th>
                <th className="px-6 py-4 font-bold text-text-secondary w-32">Score</th>
                <th className="px-6 py-4 font-bold text-text-secondary w-24 text-center">Grade</th>
                <th className="px-6 py-4 font-bold text-text-secondary w-48">Remarks</th>
                <th className="px-6 py-4 font-bold text-text-secondary w-24 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students?.map((s: any) => (
                <tr key={s._id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-3 font-semibold text-text-muted">{s.studentId}</td>
                  <td className="px-6 py-3 font-bold text-text-primary">{s.fullName}</td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      max={selectedExam.maxMarks}
                      min={0}
                      value={marksState[s._id]?.score ?? ''}
                      onChange={e => setMarksState(prev => ({ ...prev, [s._id]: { ...prev[s._id], score: e.target.value === '' ? undefined : Number(e.target.value) } as any }))}
                      onBlur={() => handleBlur(s._id)}
                      className="w-full border border-border rounded-lg px-3 py-1.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-bold outline-none"
                    />
                  </td>
                  <td className="px-6 py-3 font-bold text-center text-text-primary text-lg">
                    {getGrade(marksState[s._id]?.score, selectedExam.maxMarks)}
                  </td>
                  <td className="px-6 py-3">
                    <input type="text"
                      placeholder="Optional"
                      value={marksState[s._id]?.remarks || ''}
                      onChange={e => setMarksState(prev => ({ ...prev, [s._id]: { ...prev[s._id], remarks: e.target.value } as any }))}
                      onBlur={() => handleBlur(s._id)}
                      className="w-full border border-border rounded-lg px-3 py-1.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    {saveStatus[s._id] === 'saving' && <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-500"><LoadingSpinner /> Saving</span>}
                    {saveStatus[s._id] === 'saved' && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500"><Check className="w-4 h-4" /> Saved</span>}
                    {saveStatus[s._id] === 'error' && <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500"><AlertCircle className="w-4 h-4" /> Error</span>}
                  </td>
                </tr>
              ))}
              {students?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">No active students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnterMarksPage;
