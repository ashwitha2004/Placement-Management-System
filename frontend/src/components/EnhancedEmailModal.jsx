import React, { useState, useEffect } from 'react';
import { Mail, Send, Inbox, Users, X, Loader, CheckCircle, Search, ChevronDown, Plus, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiBase';

const EnhancedEmailModal = ({ show, onClose, user, theme }) => {
  // Default user fallback for compose
  const effectiveUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const senderRole = effectiveUser?.role;
  const roleTargetsBySender = {
    student: [
      { value: 'staff', label: 'All Staff' },
      { value: 'hr', label: 'All HR' }
    ],
    staff: [
      { value: 'students', label: 'All Students' },
      { value: 'hr', label: 'All HR' }
    ],
    hr: [
      { value: 'staff', label: 'All Staff' },
      { value: 'students', label: 'All Students' }
    ]
  };
  const allowedRoleTargets = roleTargetsBySender[senderRole] || [
    { value: 'all', label: 'All Users' },
    { value: 'students', label: 'All Students' }
  ];
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('compose');
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [recipientType, setRecipientType] = useState('single'); // 'single' or 'both'
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  
  const [emailForm, setEmailForm] = useState({
    recipients: allowedRoleTargets[0].value,
    subject: '',
    message: '',
    from: effectiveUser?.email || ''
  });

  const isDark = theme === 'dark';

  const selectedTargetLabels = recipientType === 'both'
    ? allowedRoleTargets.map((target) => target.label).join(' + ')
    : (allowedRoleTargets.find((target) => target.value === emailForm.recipients)?.label || emailForm.recipients);

  useEffect(() => {
    if (show) {
      if (activeTab === 'inbox') {
        fetchEmails();
      }
      if (recipientType === 'individual') {
        fetchStudents();
      }
    }
  }, [show, activeTab, recipientType]);

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

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/emails/students/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleMarkAsRead = async (emailId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/emails/${emailId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

      const recipientsPayload = recipientType === 'both'
        ? allowedRoleTargets.map((target) => target.value)
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
        setRecipientType('single');
        setEmailForm({ recipients: allowedRoleTargets[0].value, subject: '', message: '' });
        setSelectedStudents([]);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  if (!show) return null;
  if (!effectiveUser || !token) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="rounded-3xl border max-w-lg w-full h-auto shadow-2xl flex flex-col bg-white p-8 items-center">
          <Mail className='text-blue-500 mb-4' size={40} />
          <h3 className="text-xl font-bold mb-2 text-slate-800">Email Center</h3>
          <p className="text-red-500 font-semibold mb-4">You must be logged in to use the Email Center.</p>
          <button onClick={onClose} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold mt-2">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl border max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${
          isDark ? 'border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600' : 'border-slate-200 bg-gradient-to-r from-blue-500 to-indigo-500'
        }`}>
          <div className="flex items-center gap-3">
            <Mail className='text-white' size={28} />
            <div>
              <h3 className={`text-2xl font-black text-white`}>
                Email Center
              </h3>
              <p className="text-blue-100 text-sm">Gmail-like interface for campus communications</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-all text-white hover:bg-white/20`}
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
                ? (isDark ? 'bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-500' : 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500')
                : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
            }`}
          >
            <Send size={20} />
            Compose Email
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-4 px-6 font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'inbox'
                ? (isDark ? 'bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-500' : 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500')
                : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')
            }`}
          >
            <Inbox size={20} />
            Inbox ({emails.filter(e => !e.read).length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'compose' && (
            <div className="space-y-6 max-w-3xl">
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                  <CheckCircle className="text-emerald-500 flex-shrink-0" size={24} />
                  <span className={isDark ? 'text-white font-bold' : 'text-slate-900 font-bold'}>
                    ✓ Email sent successfully to {selectedTargetLabels}!
                  </span>
                </div>
              )}

              {/* Recipient Type Selection */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Send To
                </label>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setRecipientType('single');
                      setEmailForm({...emailForm, recipients: allowedRoleTargets[0].value});
                    }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${
                      recipientType === 'single' && emailForm.recipients === allowedRoleTargets[0].value
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : (isDark ? 'border-white/20 text-slate-300 hover:border-white/40' : 'border-slate-300 text-slate-700 hover:border-slate-400')
                    }`}
                  >
                    <Users size={18} className="inline mr-2" />
                    {allowedRoleTargets[0].label}
                  </button>
                  <button
                    onClick={() => {
                      setRecipientType('single');
                      setEmailForm({...emailForm, recipients: allowedRoleTargets[1].value});
                    }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${
                      recipientType === 'single' && emailForm.recipients === allowedRoleTargets[1].value
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : (isDark ? 'border-white/20 text-slate-300 hover:border-white/40' : 'border-slate-300 text-slate-700 hover:border-slate-400')
                    }`}
                  >
                    <Users size={18} className="inline mr-2" />
                    {allowedRoleTargets[1].label}
                  </button>
                  <button
                    onClick={() => setRecipientType('both')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${
                      recipientType === 'both'
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : (isDark ? 'border-white/20 text-slate-300 hover:border-white/40' : 'border-slate-300 text-slate-700 hover:border-slate-400')
                    }`}
                  >
                    <PlusCircle size={18} className="inline mr-2" />
                    Both
                  </button>
                </div>
              </div>

              {/* Individual Student Selection */}
              {recipientType === 'individual' && (
                <div className={`border rounded-xl p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="mb-4">
                    <div className={`relative`}>
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
                      <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchStudent}
                        onChange={(e) => setSearchStudent(e.target.value)}
                        onFocus={() => setShowStudentDropdown(true)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                          isDark
                            ? 'bg-white/10 border-white/20 text-white placeholder-slate-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Selected Students Tags */}
                  {selectedStudents.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-opacity-20">
                      <p className={`text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudents.map(studentId => {
                          const student = students.find(s => s._id === studentId);
                          return student ? (
                            <div key={studentId} className="px-3 py-1 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center gap-2">
                              {student.name}
                              <button
                                onClick={() => toggleStudentSelection(studentId)}
                                className="hover:bg-indigo-600 rounded-full p-0.5"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Student List */}
                  {showStudentDropdown && (
                    <div className={`max-h-64 overflow-y-auto rounded-lg border ${isDark ? 'border-white/20 bg-slate-800' : 'border-slate-300 bg-white'}`}>
                      {loadingStudents ? (
                        <div className="p-4 text-center">
                          <Loader className="animate-spin mx-auto mb-2" size={24} />
                          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading students...</p>
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>No students found</p>
                        </div>
                      ) : (
                        filteredStudents.map(student => (
                          <div
                            key={student._id}
                            onClick={() => toggleStudentSelection(student._id)}
                            className={`p-4 border-b cursor-pointer transition-all flex items-center gap-3 ${
                              selectedStudents.includes(student._id)
                                ? (isDark ? 'bg-indigo-500/20' : 'bg-indigo-100')
                                : (isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50')
                            } ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                          >
                            <img
                              src={student.image}
                              alt={student.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {student.name}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {student.email} • {student.branch} • CGPA: {student.cgpa}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student._id)}
                              onChange={() => {}}
                              className="w-5 h-5 rounded cursor-pointer"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Subject */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Subject *
                </label>
                <input 
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  placeholder="e.g., Important Course Update"
                  className={`w-full rounded-xl px-4 py-3 border transition-all ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  } focus:outline-none`}
                />
              </div>

              {/* Message */}
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Message *
                </label>
                <textarea 
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                  placeholder="Type your message here... You can include announcements, updates, or notifications."
                  rows={12}
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Email ({selectedTargetLabels})
                  </>
                )}
              </button>
            </div>
          )}

          {/* Inbox Tab */}
          {activeTab === 'inbox' && (
            <div className="space-y-3 max-w-3xl">
              {loading ? (
                <div className="text-center py-12">
                  <Loader className={`animate-spin mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} size={48} />
                  <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading emails...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Mail size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">No emails yet</p>
                  <p className="text-sm">Your inbox will appear here</p>
                </div>
              ) : (
                emails.map((email) => {
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
                          : (isDark ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-100 hover:bg-blue-100')
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {!email.read && !email.isSender && <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />}
                          <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {fromName}
                          </h4>
                        </div>
                        <span className={`text-xs flex-shrink-0 ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {timeAgo}
                        </span>
                      </div>
                      <p className={`font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {email.subject}
                      </p>
                      <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {email.message}
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

export default EnhancedEmailModal;
