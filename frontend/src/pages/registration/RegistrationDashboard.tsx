import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/api';
import { Users, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const RegistrationDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['finance-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/stats');
      return res.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Failed to load stats.</div>;

  const data = stats?.data || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mb-1">
            Registration Overview
          </h1>
          <p className="text-sm font-medium text-text-secondary">
            Manage student registrations and fee collections
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">Registrations</h3>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <Link
            to="/register/students"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Register New Student
          </Link>
        </div>

        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">Fee Payments</h3>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <Link
            to="/register/fees"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-primary text-primary rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Record Fee Payment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDashboard;
