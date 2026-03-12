import React, { useState, useEffect } from 'react';
import api from "../../utils/api";import { Calendar, Video, Users, Clock, CheckCircle, XCircle, Plus, Search, Filter } from 'lucide-react';
import { examsAPI } from '../../services/api';
import { format, parseISO } from 'date-fns';

const StaffInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [examSubmissions, setExamSubmissions] = useState([]);

  useEffect(() => {
    fetchInterviews();
    fetchStudents();
    fetchExamSubmissions();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews');
      const mapped = (res.data.interviews || []).map((interview) => ({
        id: interview._id,
        student: interview.student?.user?.name || interview.student?.name || 'Student',
        position: interview.job?.position || 'Role',
        company: interview.job?.company || 'Company',
        date: interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString('en-IN') : 'TBD',
        time: interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        status: interview.result === 'pending' ? 'scheduled' : interview.result,
        type: 'video',
        duration: '45 mins',
        roomId: interview.roomId
      }));
      setInterviews(mapped.length ? mapped : mockInterviews);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
      setInterviews(mockInterviews);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students?limit=20');
      setStudents(res.data.students || res.data || mockStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents(mockStudents);
    }
  };

  const fetchExamSubmissions = async () => {
    try {
      const res = await examsAPI.getAllSubmissions();
      setExamSubmissions(res.data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch exam results', error);
    }
  };

  // Video call connect logic will be handled by WebRTC integration

  // Mock data for development
  const mockInterviews = [
    {
      id: '1',
      student: 'Vamsi Valluri',
      position: 'Frontend Developer',
      company: 'TechCorp',
      date: '2026-01-28',
      time: '10:00 AM',
      status: 'scheduled',
      type: 'video',
      duration: '45 mins',
      notes: 'Strong React portfolio'
    },
    {
      id: '2',
      student: 'Priya Sharma',
      position: 'Backend Engineer',
      company: 'FinTech Ltd',
      date: '2026-01-29',
      time: '02:30 PM',
      status: 'completed',
      type: 'phone',
      duration: '30 mins',
      rating: 4.2,
      notes: 'Excellent DSA knowledge'
    },
    {
      id: '3',
      student: 'Rahul Mehta',
      position: 'Fullstack Developer',
      company: 'HealthAI',
      date: '2026-01-30',
      time: '11:00 AM',
      status: 'cancelled',
      type: 'video',
      duration: '60 mins',
      notes: 'Student unavailable'
    }
  ];

  const mockStudents = [
    { id: '1', name: 'Vamsi Valluri', cgpa: 8.7, branch: 'CSE', email: 'vamsi@example.com' },
    { id: '2', name: 'Priya Sharma', cgpa: 9.2, branch: 'ECE', email: 'priya@example.com' },
    { id: '3', name: 'Rahul Mehta', cgpa: 8.1, branch: 'CSE', email: 'rahul@example.com' }
  ];

  const filteredInterviews = interviews.filter(interview => {
    const studentName = interview.student?.user?.name || interview.student?.name || interview.student || '';
    const position = interview.job?.position || interview.position || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || interview.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusUpdate = async (interviewId, newStatus) => {
    try {
      await api.patch(`/staff/interviews/${interviewId}/status`, { status: newStatus });
      setInterviews(prev => prev.map(i => 
        i.id === interviewId ? { ...i, status: newStatus } : i
      ));
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Interview Management
          </h1>
          <p className="text-xl text-gray-600">Schedule, track, and manage student interviews</p>
        </div>
        <div className="flex items-center space-x-3 text-2xl font-bold text-gray-900 bg-white px-6 py-3 rounded-2xl shadow-lg">
          <Calendar className="w-8 h-8 text-blue-600" />
          {interviews.filter(i => i.status === 'scheduled').length} Scheduled Today
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students, positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg placeholder-gray-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/50 backdrop-blur-xl border border-white/30 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center ml-auto lg:ml-0"
        >
          <Plus className="mr-2 w-5 h-5" />
          Schedule Interview
        </button>
      </div>

      {/* Interviews Grid */}
      {loading ? (
        <div className="glass-card p-20 rounded-3xl grid place-items-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
            <p className="text-xl text-gray-600">Loading interviews...</p>
          </div>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="glass-card p-20 rounded-3xl text-center">
          <Calendar className="w-24 h-24 text-gray-400 mx-auto mb-8" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No interviews scheduled</h3>
          <p className="text-lg text-gray-600 mb-8">Get started by scheduling your first interview</p>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
            Schedule Interview
          </button>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-6 font-bold text-gray-900 pr-4">Student</th>
                  <th className="text-left py-6 font-bold text-gray-900 pr-4">Position</th>
                  <th className="text-left py-6 font-bold text-gray-900 pr-4">Company</th>
                  <th className="text-left py-6 font-bold text-gray-900 pr-4">Date & Time</th>
                  <th className="text-left py-6 font-bold text-gray-900 pr-4">Status</th>
                  <th className="text-left py-6 font-bold text-gray-900 pr-4">Duration</th>
                  <th className="text-left py-6 font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInterviews.map((interview) => (
                  <tr 
                    key={interview.id} 
                    className="hover:bg-white/30 transition-colors group"
                    onClick={() => setSelectedInterview(interview)}
                  >
                    <td className="py-6 pr-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{interview.student}</p>
                          <p className="text-sm text-gray-600">CSE • 8.7 CGPA</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-6 pr-4 font-semibold text-gray-900">{interview.position}</td>
                    <td className="py-6 pr-4">
                      <span className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-xl font-bold text-gray-900">
                        {interview.company}
                      </span>
                    </td>
                    
                    <td className="py-6 pr-4">
                      <div>
                        <p className="font-bold text-lg">{interview.date}</p>
                        <p className="text-sm text-gray-600">{interview.time}</p>
                      </div>
                    </td>
                    
                    <td className="py-6 pr-4">
                      <span className={`px-4 py-2 rounded-2xl font-bold text-sm shadow-md ${getStatusColor(interview.status)}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="py-6 pr-4 font-medium text-gray-900">{interview.duration}</td>
                    
                    <td className="py-6">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        {/* Video call join button will be added here in WebRTC integration */}
                        <select
                          value={interview.status}
                          onChange={(e) => handleStatusUpdate(interview.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1 bg-white/60 backdrop-blur-xl border border-white/30 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="glass-card p-8 rounded-3xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Exam Results</h2>
        {examSubmissions.length === 0 ? (
          <p className="text-gray-600">No exam results yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-bold text-gray-900">Student</th>
                  <th className="text-left py-3 font-bold text-gray-900">Exam</th>
                  <th className="text-left py-3 font-bold text-gray-900">Score</th>
                  <th className="text-left py-3 font-bold text-gray-900">Result</th>
                  <th className="text-left py-3 font-bold text-gray-900">Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {examSubmissions.map((submission) => (
                  <tr key={submission._id} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-3 font-semibold text-gray-900">
                      {submission.studentUser?.name || 'Student'}
                    </td>
                    <td className="py-3 text-gray-900">{submission.exam?.title || 'Exam'}</td>
                    <td className="py-3">{submission.score ?? 'N/A'}</td>
                    <td className="py-3">{submission.result || 'pending'}</td>
                    <td className="py-3">{submission.reviewedBy?.name || 'HR'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Schedule Interview</h2>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-gray-200 rounded-2xl transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Student</label>
                <select className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Select student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.branch}) - {student.cgpa} CGPA
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Position</label>
                  <input 
                    type="text" 
                    placeholder="Frontend Developer" 
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company</label>
                  <input 
                    type="text" 
                    placeholder="TechCorp" 
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                  <input type="date" className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                  <input type="time" className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                  <select className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>30 mins</option>
                    <option>45 mins</option>
                    <option>60 mins</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
                  Schedule Interview
                </button>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-8 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          {/* Similar modal structure for interview details */}
        </div>
      )}
    </div>
  );
};

export default StaffInterviews;
