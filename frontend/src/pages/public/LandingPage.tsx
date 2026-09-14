import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useInstitutionStore } from '@/store/institutionStore';
import { useAuthStore } from '@/store/authStore';
import Footer from './Footer';
import {
  BookOpen, Users, Trophy, GraduationCap, ChevronRight, Menu, X,
  CheckCircle2, Phone, MapPin, Monitor, HeartPulse, Languages,
  Calculator, Scissors, ChefHat, Sparkles, Baby, Send, Mail, User
} from 'lucide-react';
import { ROLE_PORTAL_PATHS } from '@/utils/constants';
import { WhatsAppWidget } from '@/components/common/WhatsAppWidget';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getCourseIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('comput') || lower.includes('it')) return <Monitor className="w-8 h-8 text-accent-500" />;
  if (lower.includes('nurs') || lower.includes('health')) return <HeartPulse className="w-8 h-8 text-rose-500" />;
  if (lower.includes('english') || lower.includes('somali') || lower.includes('arabic')) return <Languages className="w-8 h-8 text-blue-500" />;
  if (lower.includes('business') || lower.includes('account')) return <Calculator className="w-8 h-8 text-emerald-500" />;
  if (lower.includes('tailor') || lower.includes('design')) return <Scissors className="w-8 h-8 text-purple-500" />;
  if (lower.includes('culinary') || lower.includes('cook')) return <ChefHat className="w-8 h-8 text-orange-500" />;
  if (lower.includes('beauty') || lower.includes('makeup') || lower.includes('henna')) return <Sparkles className="w-8 h-8 text-pink-500" />;
  if (lower.includes('child')) return <Baby className="w-8 h-8 text-teal-500" />;
  return <BookOpen className="w-8 h-8 text-primary-500" />;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { institution } = useInstitutionStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/teachers/public/subjects`)
      .then(r => {
        const subjects: string[] = r.data?.data || [];
        setCourses(subjects);
      })
      .catch(console.error)
      .finally(() => setLoadingCourses(false));
  }, []);

  const handlePortalClick = () => {
    if (isAuthenticated && user) {
      navigate(ROLE_PORTAL_PATHS[user.role as keyof typeof ROLE_PORTAL_PATHS] || '/login');
    } else {
      navigate('/login');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    try {
      await axios.post(`${API_URL}/messages`, formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Courses', href: '#courses' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <nav className={`fixed left-0 right-0 z-50 transition-all duration-300 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 top-4 md:top-6`}>
        <div className={`flex justify-between items-center px-6 py-3 rounded-full transition-all duration-300 border ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg border-white/50' : 'bg-white/60 backdrop-blur-md shadow-sm border-white/30'}`}>
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={institution.logoUrl} alt="Logo" className="h-9 w-9 rounded-xl bg-white p-1 shadow-sm object-contain" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Wadajir <span className="text-accent-500">Institute</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex gap-2">
              {navLinks.map(link => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="nav-link-hover px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-accent-500 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <button onClick={handlePortalClick} className="btn-hover px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold rounded-full shadow-md transition-colors">
              {isAuthenticated ? 'Go to Portal' : 'Portal Login'}
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={handlePortalClick}
              className="btn-hover cursor-pointer p-2 rounded-full text-white bg-accent-500 hover:bg-accent-600 shadow-sm flex items-center justify-center transition-all active:scale-90 hover:scale-105 hover:shadow-md"
              aria-label="Login"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg text-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 py-4 px-4 flex flex-col gap-3">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="sidebar-link text-slate-700 font-bold px-4 py-3 rounded-xl"
              >
                {link.name}
              </a>
            ))}
            
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative pt-32 pb-8 md:pt-40 md:pb-12 bg-slate-50/50 overflow-hidden">
        {/* Colorful Abstract Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 tracking-tight mb-6 leading-[1.2]">
                Master skills <br className="hidden lg:block" />
                for a <span className="font-semibold text-accent-500">brighter future</span>
              </h1>
              <p className="text-base md:text-lg text-slate-500 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
                We provide world-class vocational training designed for real-world success. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#courses" className="btn-hover px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-full shadow-md flex items-center justify-center gap-2 transition-all">
                  <BookOpen className="w-4 h-4" /> Explore
                </a>
                <a href="#contact" className="btn-hover px-7 py-3 bg-white text-slate-700 font-medium rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm flex items-center justify-center gap-2 transition-all">
                  <Phone className="w-4 h-4" /> Contact
                </a>
              </div>
            </div>

            <div className="relative mt-10 lg:mt-0 flex justify-center w-full">
              {/* Checkmark Badge */}
              <div className="absolute -left-4 bottom-24 bg-white p-3 rounded-2xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '4s' }}>
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>

              <img
                src="/tailoring-machine.jpg"
                alt="Vocational Training"
                className="relative z-10 w-full max-w-[150px] md:max-w-[400px] aspect-[4/5] object-cover mx-auto rounded-t-[3rem]"
                style={{ 
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 sm:gap-8">
          {[
            { icon: <Users className="w-6 h-6" />, color: 'text-primary-600', title: 'Expert Instructors', desc: 'Learn from industry professionals with years of hands-on experience.' },
            { icon: <BookOpen className="w-6 h-6" />, color: 'text-accent-600', title: 'Modern Curriculum', desc: 'Our courses are constantly updated to match the latest market demands.' },
            { icon: <Trophy className="w-6 h-6" />, color: 'text-teal-600', title: 'Certified Success', desc: 'Graduate with recognized certifications that open doors globally.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-8 border border-slate-200 hover:border-slate-300 transition-colors group flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className={`w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-6 bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-[10px] sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 leading-tight">{f.title}</h3>
              <p className="text-slate-500 text-[8px] sm:text-sm leading-relaxed hidden sm:block">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-accent-50 text-accent-700 font-bold text-sm mb-6 border border-accent-100">
                About Our Institute
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                Dedicated to Excellence in Education
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg font-medium">
                Since our founding, Wadajir Institute has been committed to transforming lives through accessible, high-quality technical education.
              </p>
              <ul className="space-y-4 mb-8">
                {['State-of-the-art learning facilities', 'Comprehensive career support and guidance', 'Flexible learning schedules for professionals', 'Community-focused development programs'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-800 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-accent-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <img
                  src="/makeup.jpg"
                  alt="Henna and Makeup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 font-bold text-sm mb-4 border border-primary-100">
              Our Courses
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Explore Our Programs</h2>
            <p className="text-slate-600 text-lg font-medium">Discover courses designed to equip you with the exact skills employers are looking for.</p>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No courses available yet</h3>
              <p className="text-slate-500 mt-2 text-sm">Courses appear once assigned to teachers in the Principal portal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
              {courses.map(course => (
                <div key={course} className="btn-hover bg-white rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all group flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2 sm:mb-5 group-hover:scale-105 transition-transform">
                    {getCourseIcon(course)}
                  </div>
                  <h3 className="text-[10px] sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 leading-tight">{course}</h3>
                  <p className="text-[8px] sm:text-sm text-accent-600 font-bold flex items-center justify-center sm:justify-start gap-1 mt-auto group-hover:translate-x-1 transition-transform">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-16">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-sm mb-6 shadow-sm">
                  Contact Us
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6 text-slate-900">Ready to Start Your Journey?</h2>
                <p className="text-slate-600 mb-12 text-lg font-medium leading-relaxed">
                  Reach out to learn more about enrollment, schedules, and finding the perfect program for you.
                </p>
                <div className="space-y-8">
                  <div className="flex items-center gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                      <Phone className="text-accent-600 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Call Us</p>
                      <p className="text-lg font-bold text-slate-900">{institution.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                      <Mail className="text-accent-600 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email</p>
                      <p className="text-lg font-bold text-slate-900">{institution.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                      <MapPin className="text-accent-600 w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Visit Us</p>
                      <p className="text-base font-bold text-slate-900">{institution.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 md:p-16 flex flex-col justify-center lg:border-l border-slate-100">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Send a Message</h3>
                <form className="space-y-5" onSubmit={handleContactSubmit}>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text" required value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-medium bg-slate-50"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email" required value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-medium bg-slate-50"
                      placeholder="Your Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                    <textarea
                      rows={4} required value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-medium bg-slate-50 resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Message sent successfully!
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold border border-rose-200 flex items-center gap-2">
                      <X className="w-5 h-5" /> Failed to send. Please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    className="btn-hover w-full py-4 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 hover:bg-slate-800 transition-colors"
                  >
                    {submitStatus === 'submitting' ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppWidget />
    </div>
  );
};

export default LandingPage;
