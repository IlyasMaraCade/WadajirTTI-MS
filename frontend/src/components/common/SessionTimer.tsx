import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logoutUser } from '@/services/authService';
import { Clock, ShieldAlert } from 'lucide-react';

const SESSION_DURATION_SECONDS = 5 * 60; // 5 minutes fixed

export const SessionTimer: React.FC = () => {
  const navigate = useNavigate();
  const { clearAuth, isAuthenticated } = useAuthStore();
  const [secondsLeft, setSecondsLeft] = useState<number>(SESSION_DURATION_SECONDS);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          logoutUser().catch(() => {});
          clearAuth();
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, clearAuth, navigate]);

  if (!isAuthenticated) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLow = secondsLeft <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-sm border ${
        isLow
          ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/10 animate-pulse'
          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shadow-emerald-500/5'
      }`}
      title="Session Expiry Countdown"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isLow ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLow ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        ></span>
      </span>
      {isLow ? <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> : <Clock className="w-3.5 h-3.5 text-emerald-600" />}
      <span className="font-mono tracking-wider text-[12px] font-bold">{formattedTime}</span>
    </div>
  );
};

export default SessionTimer;
