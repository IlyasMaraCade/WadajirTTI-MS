import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
      <p className="text-text-secondary mb-8">You do not have permission to access this page.</p>
      <Link to="/" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600">
        Return Home
      </Link>
    </div>
  );
};

export default Unauthorized;