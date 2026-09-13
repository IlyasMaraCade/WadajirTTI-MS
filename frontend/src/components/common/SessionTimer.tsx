import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logoutUser } from '@/services/authService';
import { Clock, ShieldAlert } from 'lucide-react';

const SESSION_DURATION_SECONDS = 5 * 60; // 5 minutes
const STORAGE_KEY = 'wadajir_session_expiry';

const SessionTimer: React.FC = () => {
  const navigate = useNavigate();
  const { clearAuth, isAuthenticated } = useAuthStore();
  const [secondsLeft, setSecondsLeft] = useState<number>(SESSION_DURATION_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSecondsLeft = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return SESSION_DURATION_SECONDS;
    const expiry = parseInt(stored, 10);
    const now = Date.now();
    return Math.max(0, Math.round((expiry - now) / 1000));
  }, []);

  const resetTimer = useCallback(() => {
    const newExpiry = Date.now() + SESSION_DURATION_SECONDS * 1000;
    localStorage.setItem(STORAGE_KEY, String(newExpiry));
    setSecondsLeft(SESSION_DURATION_SECONDS);
  }, []);

  const handleExpiry = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    try { await logoutUser(); } catch {}
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // On mount: if no stored expiry, set one now
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      resetTimer();
    } else {
      const remaining = getSecondsLeft();
      if (remaining <= 0) {
        handleExpiry();
        return;
      }
      setSecondsLeft(remaining);
    }

    // Tick every second
    intervalRef.current = setInterval(() => {
      const remaining = getSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleExpiry();
      }
    }, 1000);

    // Reset timer on user activity
    const activityEvents = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll'];
    const onActivity = () => resetTimer();
    activityEvents.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      activityEvents.forEach(evt => window.removeEventListener(evt, onActivity));
    };
  }, [isAuthenticated, resetTimer, getSecondsLeft, handleExpiry]);

  // Clean up storage on logout
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated]);

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
          : 'bg-slate-500/10 text-slate-600 border-slate-400/20'
      }`}
      title="Session Expiry — resets on activity"
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isLow ? 'bg-rose-500' : 'bg-slate-400'
          }`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLow ? 'bg-rose-600' : 'bg-slate-500'
          }`}
        ></span>
      </span>
      {isLow ? <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
      <span className="font-mono tracking-wider text-[12px] font-bold">{formattedTime}</span>
    </div>
  );
};

export default SessionTimer;
