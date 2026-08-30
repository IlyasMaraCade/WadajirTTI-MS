import React from 'react';

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
    <div className="flex">
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);