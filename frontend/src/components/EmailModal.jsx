import React, { useState, useEffect } from 'react';
import { Mail, Send, Inbox, Users, X, Loader, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiBase';

const EmailModal = ({ show, onClose, user, theme }) => {
  const [activeTab, setActiveTab] = useState('compose');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [emailForm, setEmailForm] = useState({
    recipients: 'all',
    subject: '',
    message: ''
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    if (show && activeTab === 'inbox') {
      fetchEmails();
    }
  }, [show, activeTab]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/emails/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(response.data.emails);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (emailId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/emails/${emailId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setEmails(emails.map(email => 
        email._id === emailId ? { ...email, read: true } : email
      ));
    } catch (error) {
      console.error('Failed to mark email as read:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      alert('Please fill in subject and message');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const recipientsPayload = emailForm.recipients === 'campus'
        ? ['students', 'staff', 'hr']
        : emailForm.recipients;

      await axios.post(`${API_BASE_URL}/emails/send`, {
        to: recipientsPayload,
        subject: emailForm.subject,
        message: emailForm.message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmailForm({ recipients: 'all', subject: '', message: '' });
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl border max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <Mail className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={24} />
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Email Center
            </h3>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex-1 py-4 px-6 font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'compose'
                ? (isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white')
                : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
            }`}
          >
            <Send size={18} />
            Compose
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-4 px-6 font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'inbox'
                ? (isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white')
                : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
            }`}
          >
            <Inbox size={18} />
            Inbox
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'compose' && (
            <div className="space-y-6">
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="text-emerald-500" size={24} />
                  <span className={isDark ? 'text-white' : 'text-slate-900'}>Email sent successfully!</span>
                </div>
              )}

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Recipients
                </label>
                <select 
                  value={emailForm.recipients}
                  onChange={(e) => setEmailForm({...emailForm, recipients: e.target.value})}
                  className={`w-full rounded-xl px-4 py-3 border transition-all ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                  } focus:outline-none`}
                >
                  <option value="all">All Users</option>
                  <option value="campus">All Campus (Students + Staff + HR)</option>
                  <option value="students">All Students</option>
                  <option value="hr">All HR</option>
                  <option value="staff">All Staff</option>
                  <option value="admin">All Admins</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Subject *
                </label>
                <input 
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  placeholder="Enter email subject"
                  className={`w-full rounded-xl px-4 py-3 border transition-all ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Message *
                </label>
                <textarea 
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                  placeholder="Type your message here..."
                  rows={10}
                  className={`w-full rounded-xl px-4 py-3 border transition-all resize-none ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  } focus:outline-none`}
                />
              </div>

              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Email
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <Loader className={`animate-spin mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} size={48} />
                  <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading emails...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Inbox size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">No emails</p>
                </div>
              ) : (
                emails.map((email) => {
                  // Format timestamp
                  const emailDate = new Date(email.createdAt);
                  const now = new Date();
                  const diffMs = now - emailDate;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);
                  
                  let timeAgo = '';
                  if (diffMins < 1) timeAgo = 'Just now';
                  else if (diffMins < 60) timeAgo = `${diffMins} min ago`;
                  else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                  else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

                  const fromName = email.isSender ? `You (to ${email.to})` : email.from.name;

                  return (
                    <div
                      key={email._id}
                      onClick={() => !email.read && !email.isSender && handleMarkAsRead(email._id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        email.read || email.isSender
                          ? (isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-100')
                          : (isDark ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100')
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {!email.read && !email.isSender && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {fromName}
                          </h4>
                        </div>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {timeAgo}
                        </span>
                      </div>
                      <p className={`font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {email.subject}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {email.message.length > 120 ? `${email.message.substring(0, 120)}...` : email.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
