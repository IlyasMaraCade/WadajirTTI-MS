import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPrincipalPerformance } from '@/services/portalService';
import { DataTable } from '@/components/common/DataTable';

const PrincipalPerformance = () => {
  const { data: performance = [], isLoading } = useQuery({ 
    queryKey: ['principal-performance'], 
    queryFn: getPrincipalPerformance 
  });

  const columns = [
    { accessorKey: 'className', header: 'Class Name' },
    { accessorKey: 'subjectName', header: 'Subject Name' },
    { accessorKey: 'totalExams', header: 'Total Exams' },
    { 
      accessorKey: 'averageScore', 
      header: 'Average Score (%)',
      cell: ({ getValue }: any) => {
        const val = getValue();
        let color = 'text-green-600';
        if (val < 60) color = 'text-red-600';
        else if (val < 75) color = 'text-yellow-600';
        return <span className={`font-bold ${color}`}>{val}%</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Academic Performance Monitor</h1>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <DataTable data={performance} columns={columns} isLoading={isLoading} emptyMessage="No performance data found." />
      </div>
    </div>
  );
};

export default PrincipalPerformance;

