import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight } from 'lucide-react';

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    { name: 'Admissions & Info', number: '252615716373', display: '615 716 373' },
    { name: 'Support', number: '252689080011', display: '689 080 011' },
  ];

  const handleWhatsApp = (number: string) => {
    window.open(`https://wa.me/${number}?text=Hello, I would like to get more information about Wadajir Institute.`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Popup */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 mb-4 w-72 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 transform origin-bottom-right">
          {/* Header */}
          <div className="bg-[#25D366] p-4 flex justify-between items-center text-white">
            <div>
              <h3 className="font-bold text-lg leading-tight">Welcome! 👋</h3>
              <p className="text-xs text-white/90 font-medium">How can we help you today?</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 bg-slate-50">
            <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Choose a contact to chat</p>
            <div className="space-y-3">
              {contacts.map((contact, i) => (
                <button
                  key={i}
                  onClick={() => handleWhatsApp(contact.number)}
                  className="btn-hover w-full flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#25D366] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">{contact.name}</p>
                      <p className="text-xs font-mono text-slate-500 font-medium">{contact.display}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button Container */}
      <div className="relative group flex items-center justify-center">
        {/* Cool glowing ping effect */}
        {!isOpen && (
          <div className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping" style={{ animationDuration: '2.5s' }}></div>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">
            Chat with us!
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-hover relative w-16 h-16 bg-gradient-to-tr from-[#128C7E] to-[#25D366] hover:from-[#0f776a] hover:to-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_35px_rgba(37,211,102,0.6)] z-50 focus:outline-none"
          aria-label="Chat on WhatsApp"
        >
          {isOpen ? (
            <X className="w-8 h-8 transform rotate-90 transition-transform duration-300" />
          ) : (
            <MessageCircle className="w-9 h-9 transform group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
};
