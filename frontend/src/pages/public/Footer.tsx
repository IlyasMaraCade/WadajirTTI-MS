import React from 'react';
import { useInstitutionStore } from '@/store/institutionStore';
import { Phone, MapPin, Mail, ChevronRight, Globe } from 'lucide-react';

const Footer = () => {
  const { institution } = useInstitutionStore();

  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { name: 'Home', href: '#home' },
        { name: 'About Us', href: '#about' },
        { name: 'Our Courses', href: '#courses' },
        { name: 'Contact', href: '#contact' },
        { name: 'Student Portal', href: '/login' },
      ],
    }
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={institution.logoUrl} alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white p-1" />
              <span className="text-xl font-extrabold tracking-tight text-white">
                Wadajir <span className="text-accent-400">Institute</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Transforming lives through accessible, high-quality technical education and vocational training.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="btn-hover w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:text-white transition-all transform hover:-translate-y-1 shadow-md hover:shadow-[#1877F2]/30" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="btn-hover w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 shadow-md hover:shadow-black/50" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-white font-bold mb-6 tracking-wide">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="btn-hover text-slate-400 hover:text-white text-sm font-medium transition-all duration-300 flex items-center gap-2 group w-fit hover:translate-x-2">
                      <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 text-accent-400 transition-all duration-300" />
                      <span className="group-hover:text-accent-400 transition-colors">{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-accent-400 shrink-0 mt-0.5 group-hover:-translate-y-1 transition-transform" />
                <span className="text-slate-400 text-sm group-hover:text-white transition-colors">{institution.address}</span>
              </li>
              <li>
                <a href={`tel:${institution.phone?.replace(/[^0-9]/g, '') || ''}`} className="flex items-center gap-3 group w-fit btn-hover">
                  <Phone className="w-5 h-5 text-accent-400 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="text-slate-400 text-sm group-hover:text-white transition-colors">{institution.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${institution.email}`} className="flex items-center gap-3 group w-fit btn-hover">
                  <Mail className="w-5 h-5 text-accent-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-400 text-sm group-hover:text-white transition-colors">{institution.email}</span>
                </a>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
