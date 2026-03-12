import React, { useState, useEffect } from 'react';
import api from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import { Calendar, Video, Clock, CheckCircle, XCircle, Phone, MapPin } from 'lucide-react';

const StudentInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    // Fetch student interviews - using user's ID from JWT token
    api.get('/interviews/my-interviews').then(res => {
      const mapped = (res.data.interviews || []).map((interview) => ({
        id: interview._id,
        company: interview.job?.company || interview.company || 'Company',
        position: interview.job?.position || interview.position || 'Role',
        date: interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleDateString('en-IN') : interview.date,
        time: interview.scheduledDate ? new Date(interview.scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : interview.time,
        type: 'Video',
        status: interview.result === 'pending' ? 'scheduled' : interview.result,
        interviewer: interview.interviewer || 'HR Team',
        roomId: interview.roomId,
        location: interview.location || 'TBD'
      }));
      setInterviews(mapped.length ? mapped : mockInterviews);
      setLoading(false);
    }).catch(() => {
      setInterviews(mockInterviews);
      setLoading(false);
    });
  }, []);

  const mockInterviews = [
    {
      id: '1',
      company: 'TechCorp',
      position: 'Frontend Developer',
      date: 'Jan 28, 2026',
      time: '10:00 AM IST',
      type: 'Video',
      status: 'scheduled',
      interviewer: 'Priya Sharma',
      roomId: 'test-room-1',
      location: 'Online'
    },
    {
      id: '2',
      company: 'FinTech Ltd',
      position: 'Fullstack Engineer',
      date: 'Jan 30, 2026',
      time: '2:30 PM IST',
      type: 'Phone',
      status: 'upcoming',
      interviewer: 'Rahul Mehta',
      duration: '30 mins'
    },
    {
      id: '3',
      company: 'HealthAI',
      position: 'React Developer',
      date: 'Jan 25, 2026',
      time: '11:00 AM IST',
      type: 'Video',
      status: 'completed',
      feedback: 'Great performance!'
    }
  ];

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'scheduled') return 'bg-blue-100 text-blue-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            My Interviews
          </h1>
          <p className="text-xl text-gray-600 mt-2">Stay organized and prepared</p>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {interviews.filter(i => i.status === 'upcoming').length} Upcoming
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Upcoming Interviews */}
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="mr-3 w-7 h-7 text-blue-600" />
              Upcoming
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.filter(i => i.status === 'upcoming' || i.status === 'scheduled').map(interview => (
                <div
                  key={interview.id}
                  className="group bg-white/40 backdrop-blur-xl p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all border border-white/30 cursor-pointer"
                  onClick={() => setSelectedInterview(interview)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold mr-3 ${getStatusColor(interview.status)}`}>
                        {interview.status.toUpperCase()}
                      </div>
                      <Video className={`w-5 h-5 ${interview.type === 'Video' ? 'text-purple-600' : 'text-green-600'}`} />
                    </div>
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <h4 className="font-bold text-xl mb-2 text-gray-900">{interview.position}</h4>
                  <p className="text-gray-700 mb-4 font-semibold">{interview.company}</p>
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {interview.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {interview.date} • {interview.time}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      {interview.interviewer}
                    </span>
                    {interview.status === 'scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (interview.roomId) {
                            navigate(`/interview-room/${interview.roomId}`);
                          }
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-xl transition-all"
                      >
                        Join Interview
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Interviews */}
          {interviews.filter(i => i.status === 'completed').length > 0 && (
            <div className="glass-card p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-6">Past Interviews</h3>
              <div className="space-y-4">
                {interviews.filter(i => i.status === 'completed').map(interview => (
                  <div key={interview.id} className="flex items-center p-6 bg-white/30 rounded-2xl hover:bg-white/50 transition-all">
                    <CheckCircle className="w-12 h-12 text-green-500 mr-4 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-bold text-lg mr-3">{interview.position}</h4>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          Completed
                        </span>
                      </div>
                      <p className="text-gray-700 mb-1">{interview.company}</p>
                      <p className="text-sm text-gray-600">{interview.date} • {interview.time}</p>
                      {interview.feedback && (
                        <p className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded-xl font-medium">
                          "{interview.feedback}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Interview Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedInterview(null)}
            >
              <XCircle className="w-6 h-6" />
            </button>
            {selectedInterview.roomId && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200 mb-4">
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  <Video className="mr-2 w-5 h-5 text-blue-600" />
                  Join Interview Room
                </h4>
                <button
                  onClick={() => {
                    setSelectedInterview(null);
                    navigate(`/interview-room/${selectedInterview.roomId}`);
                  }}
                  className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-center mt-2 hover:bg-blue-700 transition-all"
                >
                  Open Interview Room
                </button>
              </div>
            )}
            <h3 className="font-bold text-xl mb-4">{selectedInterview.position}</h3>
            <p className="text-4xl font-black text-blue-600 mb-2">{selectedInterview.company}</p>
            <div className={`inline-block px-4 py-2 rounded-full font-bold ${getStatusColor(selectedInterview.status)}`}>
              {selectedInterview.status.toUpperCase()}
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                <Calendar className="w-6 h-6 text-gray-500 mr-3" />
                <div>
                  <p className="font-semibold">{selectedInterview.date}</p>
                  <p className="text-sm text-gray-600">{selectedInterview.time}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                <Video className="w-6 h-6 text-purple-600 mr-3" />
                <span className="font-semibold">{selectedInterview.type} Interview</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInterviews;
