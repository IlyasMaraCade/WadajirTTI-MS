import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useInstitutionStore } from '@/store/institutionStore';
import { useAuthStore } from '@/store/authStore';
import Footer from './Footer';
import {
  BookOpen, Users, Trophy, GraduationCap, ChevronRight, Menu, X,
  CheckCircle2, Phone, MapPin, Monitor, HeartPulse, Languages,
  Calculator, Scissors, ChefHat, Sparkles, Baby, Send, Mail
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
    axios.get(`${API_URL}/teachers`, { params: { limit: 1000 } })
      .then(r => {
        const teachers: any[] = r.data?.data || [];
        const courseSet = new Set<string>();
        teachers.forEach(t => {
          (t.subjects || []).forEach((s: string) => { if (s.trim()) courseSet.add(s.trim()); });
        });
        setCourses(Array.from(courseSet).sort());
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
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={institution.logoUrl} alt="Logo" className="h-10 w-10 rounded-xl bg-white p-1 shadow-sm object-contain" />
              <span className={`text-xl font-extrabold tracking-tight ${isScrolled ? 'text-primary-900' : 'text-white'}`}>
                Wadajir <span className="text-accent-400">Institute</span>
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              <ul className="flex gap-2">
                {navLinks.map(link => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className={`nav-link-hover px-4 py-2 rounded-xl text-sm font-bold ${isScrolled ? 'text-slate-700' : 'text-white'}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
              <button onClick={handlePortalClick} className="btn-hover px-6 py-2.5 bg-accent-500 text-white text-sm font-bold rounded-xl shadow-lg">
                {isAuthenticated ? 'Go to Portal' : 'Portal Login'}
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-slate-800' : 'text-white'}`}
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
            <button onClick={handlePortalClick} className="btn-hover mt-2 px-6 py-3 bg-accent-500 text-white font-bold rounded-xl shadow-md">
              {isAuthenticated ? 'Go to Portal' : 'Portal Login'}
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-primary-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]">
                Master Skills for a <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">Brighter Future</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Wadajir Institute provides world-class vocational training and professional education designed for real-world success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#courses" className="btn-hover px-8 py-4 bg-accent-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                  Explore Courses <ChevronRight className="w-5 h-5" />
                </a>
                <a href="#contact" className="btn-hover px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 flex items-center justify-center">
                  Contact Us
                </a>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0 flex justify-center w-full">
              {/* Decorative glow */}
              <div className="absolute inset-0 bg-accent-500/30 blur-[100px] rounded-full z-0 w-3/4 h-3/4 m-auto"></div>
              <img
                src="/tailoring-machine.jpg"
                alt="Vocational Training"
                className="relative z-10 w-full max-w-[600px] object-cover rounded-[2rem] shadow-2xl border-8 border-white/10 hover:border-white/20 transition-all duration-500"
                style={{ maxHeight: '500px', minHeight: '350px' }}
              />
            </div>
          </div>
        </div>

        {/* Curved separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
          <svg className="relative block w-full h-[60px] md:h-[100px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,120.34,201.39,112.5,242.49,107.97,282.51,78.27,321.39,56.44Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Users className="w-8 h-8" />, color: 'bg-primary-50 text-primary-600', title: 'Expert Instructors', desc: 'Learn from industry professionals with years of hands-on experience.' },
            { icon: <BookOpen className="w-8 h-8" />, color: 'bg-accent-50 text-accent-600', title: 'Modern Curriculum', desc: 'Our courses are constantly updated to match the latest market demands.' },
            { icon: <Trophy className="w-8 h-8" />, color: 'bg-teal-50 text-teal-600', title: 'Certified Success', desc: 'Graduate with recognized certifications that open doors globally.' },
          ].map((f, i) => (
            <div key={i} className="card-hover bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-6`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{f.desc}</p>
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
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img
                  src="/makeup.jpg"
                  alt="Henna and Makeup"
                  className="card-hover w-full h-full object-cover"
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
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No courses available yet</h3>
              <p className="text-slate-500 mt-2 text-sm">Courses appear once assigned to teachers in the Principal portal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map(course => (
                <div key={course} className="card-hover bg-white rounded-3xl p-8 border border-slate-100 shadow-sm cursor-pointer">
                  <div className="mb-6">{getCourseIcon(course)}</div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">{course}</h3>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
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
          <div className="bg-primary-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 md:p-16 text-white">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-sm mb-6 border border-white/20">
                  Contact Us
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to Start Your Journey?</h2>
                <p className="text-primary-100 mb-12 text-lg font-medium leading-relaxed">
                  Reach out to learn more about enrollment, schedules, and finding the perfect program for you.
                </p>
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                      <Phone className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-200 font-medium">Call Us</p>
                      <p className="text-xl font-bold">{institution.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                      <Mail className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-200 font-medium">Email</p>
                      <p className="text-xl font-bold">{institution.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                      <MapPin className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-200 font-medium">Visit Us</p>
                      <p className="text-lg font-bold">{institution.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-10 md:p-16 flex flex-col justify-center">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-8">Send a Message</h3>
                <form className="space-y-5" onSubmit={handleContactSubmit}>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text" required value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-500 font-medium bg-white"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email" required value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-500 font-medium bg-white"
                      placeholder="Your Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                    <textarea
                      rows={4} required value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-500 font-medium bg-white resize-none"
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
                    className="btn-hover w-full py-4 bg-primary-600 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
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
