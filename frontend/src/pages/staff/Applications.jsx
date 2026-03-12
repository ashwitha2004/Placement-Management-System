import React, { useState, useEffect } from 'react';
import api from "../../utils/api";
import { applicationsAPI, detailedApplicationsAPI } from '../../services/api';
import { Search, Filter, CheckCircle, XCircle, Clock, ArrowLeft, Mail, Phone, Download, Eye, FileJson, Briefcase, User, BookOpen, Award, Zap } from 'lucide-react';
import { format } from 'date-fns';

const StaffApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDetailedApplicationModal, setShowDetailedApplicationModal] = useState(false);
  const [detailedApplication, setDetailedApplication] = useState(null);
  const [loadingDetailedApplication, setLoadingDetailedApplication] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchDetailedApplication = async (studentId) => {
    setLoadingDetailedApplication(true);
    try {
      const res = await detailedApplicationsAPI.getByStudent(studentId);
      setDetailedApplication(res.data?.form || null);
    } catch (error) {
      console.error('Failed to fetch detailed application:', error);
      setDetailedApplication(null);
    } finally {
      setLoadingDetailedApplication(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationsAPI.getAll();
      const mapped = (res.data.applications || []).map((app) => ({
        id: app._id,
        student: app.student?.user?.name || app.student?.name || 'Student',
        studentEmail: app.student?.user?.email || app.student?.email || 'No email',
        position: app.job?.position || 'Role',
        company: app.job?.company || 'Company',
        appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'Unknown',
        status: app.status || 'pending',
        resumeLink: app.resume || null,
        studentPhone: app.student?.user?.phone || app.student?.phone || 'N/A',
        fullData: app
      }));
      setApplications(mapped);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchSearchTerm = app.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchSearchTerm && matchStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'applied': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/50';
      case 'shortlisted': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/50';
      case 'interview': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/50';
      case 'accepted': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/50';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500/50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'interview': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">All Applications</h2>
          <p className="text-gray-600 dark:text-slate-300 mt-1 font-bold text-lg">View and manage all student job applications</p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by student name, position, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border-2 border-gray-300 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'applied', 'shortlisted', 'interview', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 rounded-xl font-bold text-sm uppercase transition-all border-2 ${
                filterStatus === status
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-white/10 hover:border-blue-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-white/10 shadow-lg dark:shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-900 border-b-2 border-gray-300 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Candidate</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Position</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Company</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Applied Date</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Status</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-800 dark:text-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                    <p className="font-bold">Loading applications...</p>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-500 dark:text-slate-400">
                    <div className="space-y-3">
                      <div className="text-6xl">📋</div>
                      <p className="font-bold text-lg">No applications found</p>
                      <p className="text-sm opacity-75">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {app.student.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{app.student}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{app.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-slate-300">{app.position}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-600 dark:text-slate-400">{app.company}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-600 dark:text-slate-400">{app.appliedDate}</td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-2 rounded-full text-xs font-black border-2 inline-flex items-center gap-2 ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button 
                          onClick={() => {
                            fetchDetailedApplication(app.fullData.student._id);
                            setShowDetailedApplicationModal(true);
                          }}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <FileJson size={14} /> Form
                        </button>
                        <a
                          href={`mailto:${app.studentEmail}`}
                          className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Mail size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-black">Application Details</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-sm font-black text-gray-600 dark:text-slate-400 uppercase mb-2">Candidate</h4>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{selectedApplication.student}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">{selectedApplication.studentEmail}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-black text-gray-600 dark:text-slate-400 uppercase mb-2">Position</h4>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedApplication.position}</p>
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-600 dark:text-slate-400 uppercase mb-2">Company</h4>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedApplication.company}</p>
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-600 dark:text-slate-400 uppercase mb-2">Applied Date</h4>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedApplication.appliedDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-600 dark:text-slate-400 uppercase mb-2">Status</h4>
                  <span className={`px-3 py-2 rounded-full text-xs font-black border inline-flex items-center gap-1 ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 dark:border-white/10 pt-6">
                <h4 className="text-sm font-black text-gray-600 dark:text-slate-400 uppercase mb-4">Contact Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-blue-600" size={18} />
                    <a href={`mailto:${selectedApplication.studentEmail}`} className="text-blue-600 hover:underline font-semibold">
                      {selectedApplication.studentEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-green-600" size={18} />
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedApplication.studentPhone}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold transition-all hover:bg-gray-300 dark:hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Application Modal */}
      {showDetailedApplicationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-2xl font-black">Detailed Application Form</h3>
              <button 
                onClick={() => setShowDetailedApplicationModal(false)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
              {loadingDetailedApplication ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-slate-400 font-bold">Loading detailed application...</p>
                </div>
              ) : !detailedApplication ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-gray-600 dark:text-slate-400 font-bold">No detailed application form found for this student</p>
                </div>
              ) : (
                <>
                  {/* Biographical Information */}
                  <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 bg-gray-50 dark:bg-slate-900">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center">
                      <User size={20} className="mr-2" /> Biographical Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">Full Name</p>
                        <p className="text-gray-900 dark:text-white font-semibold">{detailedApplication.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">Email</p>
                        <p className="text-gray-900 dark:text-white font-semibold">{detailedApplication.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">Phone</p>
                        <p className="text-gray-900 dark:text-white font-semibold">{detailedApplication.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">LinkedIn</p>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold break-all">{detailedApplication.linkedIn || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">GitHub</p>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold break-all">{detailedApplication.github || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">Portfolio/Website</p>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold break-all">{detailedApplication.website || 'N/A'}</p>
                      </div>
                    </div>
                    {detailedApplication.summary && (
                      <div className="mt-4">
                        <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-2">Professional Summary</p>
                        <p className="text-gray-700 dark:text-slate-300">{detailedApplication.summary}</p>
                      </div>
                    )}
                  </div>

                  {/* Work Experience */}
                  {detailedApplication.workExperience && detailedApplication.workExperience.length > 0 && (
                    <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 bg-gray-50 dark:bg-slate-900">
                      <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center">
                        <Briefcase size={20} className="mr-2" /> Work Experience
                      </h4>
                      <div className="space-y-4">
                        {detailedApplication.workExperience.map((exp, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                            <p className="font-black text-gray-900 dark:text-white">{exp.position}</p>
                            <p className="text-gray-600 dark:text-slate-400 text-sm">{exp.company} • {exp.duration}</p>
                            <p className="text-gray-700 dark:text-slate-300 text-sm mt-2">{exp.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {detailedApplication.skills && detailedApplication.skills.length > 0 && (
                    <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 bg-gray-50 dark:bg-slate-900">
                      <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center">
                        <Zap size={20} className="mr-2" /> Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {detailedApplication.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {detailedApplication.education && detailedApplication.education.length > 0 && (
                    <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 bg-gray-50 dark:bg-slate-900">
                      <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center">
                        <BookOpen size={20} className="mr-2" /> Education
                      </h4>
                      <div className="space-y-4">
                        {detailedApplication.education.map((edu, idx) => (
                          <div key={idx} className="border-l-4 border-emerald-500 pl-4 py-2">
                            <p className="font-black text-gray-900 dark:text-white">{edu.degree}</p>
                            <p className="text-gray-600 dark:text-slate-400 text-sm">{edu.school} • {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {detailedApplication.certifications && detailedApplication.certifications.length > 0 && (
                    <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 bg-gray-50 dark:bg-slate-900">
                      <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center">
                        <Award size={20} className="mr-2" /> Certifications
                      </h4>
                      <div className="space-y-4">
                        {detailedApplication.certifications.map((cert, idx) => (
                          <div key={idx} className="border-l-4 border-amber-500 pl-4 py-2">
                            <p className="font-black text-gray-900 dark:text-white">{cert.name}</p>
                            <p className="text-gray-600 dark:text-slate-400 text-sm">{cert.issuer} • {cert.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {detailedApplication.coverLetter && (
                    <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 bg-gray-50 dark:bg-slate-900">
                      <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4">Cover Letter</h4>
                      <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">{detailedApplication.coverLetter}</p>
                    </div>
                  )}

                  {/* Applied Position */}
                  {(detailedApplication.appliedCompany || detailedApplication.appliedPosition) && (
                    <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 bg-gray-50 dark:bg-slate-900">
                      <h4 className="text-lg font-black text-gray-900 dark:text-white mb-4">Applied For</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">Company</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{detailedApplication.appliedCompany || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-600 dark:text-slate-400 uppercase mb-1">Position</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{detailedApplication.appliedPosition || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDetailedApplicationModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold transition-all hover:bg-gray-300 dark:hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffApplications;
