import React from 'react';
import { UnpaidFeesTable } from '@/components/finance/UnpaidFeesTable';

const UnpaidFeesPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-black text-text-primary mb-1">Unpaid Fees</h1>
        <p className="text-text-secondary text-sm">Monitor and manage outstanding monthly fees.</p>
      </div>
      <UnpaidFeesTable />
    </div>
  );
};

export default UnpaidFeesPage;
