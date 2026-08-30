import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent } from '@/services/adminService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/common/Badge';

interface Enrollment {
  _id: string;
  academicYear?: { year: string };
  class?: { name: string };
  section?: { name: string };
  status: string;
  createdAt: string;
}

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
      Failed to load student profile.
    </div>
  );

  const { student, enrollments } = data;

  const currentEnrollment = enrollments?.find((e: Enrollment) => e.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Back button & header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/students')} className="text-text-secondary hover:text-primary transition-colors text-sm">
          ← Back to Students
        </button>
      </div>

      <div className="flex items-start gap-6">
        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
          {student.firstName.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {student.firstName} {student.middleName} {student.lastName}
          </h1>
          <p className="text-text-secondary">ID: {student.studentId}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={student.status ? 'success' : 'danger'}>{student.status ? 'Active' : 'Inactive'}</Badge>
            <Badge variant="info">{student.enrollmentStatus}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h2>
          <dl className="space-y-3">
            {[
              ['Gender', student.gender],
              ['Date of Birth', student.dob ? new Date(student.dob).toLocaleDateString() : '—'],
              ['Enrollment Status', student.enrollmentStatus],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-text-secondary">{label}</dt>
                <dd className="font-medium text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Guardian Info */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Guardian Information</h2>
          <dl className="space-y-3">
            {[
              ['Name', student.guardianName],
              ['Relationship', student.guardianRelationship],
              ['Phone', student.guardianPhone],
              ['Email', student.guardianEmail || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-text-secondary">{label}</dt>
                <dd className="font-medium text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Current Enrollment */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Current Enrollment</h2>
          {currentEnrollment ? (
            <dl className="space-y-3">
              {[
                ['Academic Year', currentEnrollment.academicYear?.year],
                ['Class', currentEnrollment.class?.name],
                ['Section', currentEnrollment.section?.name],
                ['Status', currentEnrollment.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-text-secondary">{label}</dt>
                  <dd className="font-medium text-text-primary">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-text-secondary text-sm">Not currently enrolled.</p>
          )}
        </div>

        {/* Enrollment History */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Enrollment History</h2>
          {enrollments?.length > 0 ? (
            <div className="space-y-2">
              {enrollments.map((e: Enrollment) => (
                <div key={e._id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium">{e.academicYear?.year}</span>
                    <span className="text-text-secondary mx-2">→</span>
                    <span>{e.class?.name} / {e.section?.name}</span>
                  </div>
                  <Badge variant={e.status === 'Active' ? 'success' : 'default'}>{e.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No enrollment history.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

