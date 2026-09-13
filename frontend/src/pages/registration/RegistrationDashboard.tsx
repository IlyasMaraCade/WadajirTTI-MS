import React from 'react';
import { Users, BookOpen, Award, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInstitutionStore } from '@/store/institutionStore';

const StatCard: React.FC<{
  label: string;
  icon: React.ElementType;
  bgClass: string;
  textClass: string;
  iconBgClass: string;
  link: string;
}> = ({ label, icon: Icon, bgClass, textClass, iconBgClass, link }) => (
  <Link to={link} className={`card-hover relative overflow-hidden p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm cursor-pointer ${bgClass} group border border-slate-100`}>
    <div className={`h-14 w-14 rounded-2xl ${iconBgClass} flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className={`w-7 h-7 ${textClass}`} />
    </div>
    <span className={`text-sm font-black tracking-wide ${textClass}`}>{label}</span>
  </Link>
);

const RegistrationDashboard = () => {
  const { institution } = useInstitutionStore();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Banner */}
      <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold tracking-wider text-white uppercase">Registration Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              Registration & Academics
            </h1>
            <p className="text-slate-300 text-sm font-medium max-w-lg">
              Manage student enrollments, institutional exams, score entry, and student attendance seamlessly.
            </p>
          </div>
          
          <div className="hidden sm:block">
            <img src={institution.logoUrl} alt="Logo" className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          label="Register Student"
          icon={Users}
          link="/register/students"
          bgClass="bg-blue-50"
          textClass="text-blue-900"
          iconBgClass="bg-white"
        />
        <StatCard
          label="Manage Exams"
          icon={BookOpen}
          link="/register/exams"
          bgClass="bg-indigo-50"
          textClass="text-indigo-900"
          iconBgClass="bg-white"
        />
        <StatCard
          label="View Marks"
          icon={Award}
          link="/register/marks"
          bgClass="bg-emerald-50"
          textClass="text-emerald-900"
          iconBgClass="bg-white"
        />
        <StatCard
          label="Attendance"
          icon={Clock}
          link="/register/attendance"
          bgClass="bg-rose-50"
          textClass="text-rose-900"
          iconBgClass="bg-white"
        />
      </div>
    </div>
  );
};

export default RegistrationDashboard;
