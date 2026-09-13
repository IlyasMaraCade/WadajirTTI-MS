import React, { useState, useEffect } from 'react';
import apiClient from '@/services/api';
import { Mail, Check, Trash2, MailOpen } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const PrincipalMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get('/messages');
      if (res.data?.data) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch('/messages/' + id + '/read', {});
      setMessages(msgs => msgs.map(m => m._id === id ? { ...m, read: true } : m));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await apiClient.delete('/messages/' + id);
      setMessages(msgs => msgs.filter(m => m._id !== id));
    } catch (error) {
      console.error('Failed to delete message', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary-600" /> Inbox Messages
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Messages sent from the public website contact form.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <MailOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Messages</h3>
          <p className="text-slate-500 text-sm mt-1">Your inbox is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {messages.map(msg => (
            <div
              key={msg._id}
              className={'rounded-2xl border p-5 md:p-6 transition-all hover:shadow-md ' + (
                msg.read
                  ? 'bg-white border-slate-100'
                  : 'bg-white border-primary-200 shadow-sm'
              )}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className={'text-lg font-bold ' + (msg.read ? 'text-slate-700' : 'text-primary-900')}>
                      {msg.name}
                    </h3>
                    {!msg.read && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                        New
                      </span>
                    )}
                    {msg.read && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        <Check className="w-3 h-3" /> Answered
                      </span>
                    )}
                  </div>
                  <a href={'mailto:' + msg.email} className="text-sm font-medium text-accent-600 hover:underline mb-4 inline-block">
                    {msg.email}
                  </a>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-4">
                    Received on {format(new Date(msg.createdAt), 'PPP p')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                  {!msg.read && (
                    <button
                      onClick={() => markAsRead(msg._id)}
                      className="btn-hover cursor-pointer p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
                      title="Mark as answered"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="btn-hover cursor-pointer p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalMessages;
