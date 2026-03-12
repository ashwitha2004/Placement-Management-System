import React from 'react';
import { Link } from 'react-router-dom';
import { Users, User, Briefcase, Shield } from 'lucide-react';

const RoleSelect = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 max-w-4xl w-full text-center shadow-2xl">
      <h1 className="text-5xl font-bold text-white mb-8 drop-shadow-lg">Gen-AI Placement System</h1>
      <p className="text-xl text-white/90 mb-12">Select your role to continue</p>
      <div className="grid md:grid-cols-4 gap-6">
        <Link to="/login?role=student" className="group bg-white/30 hover:bg-white/50 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105">
          <User className="w-16 h-16 mx-auto mb-4 text-blue-600 group-hover:rotate-6" />
          <h3 className="text-2xl font-bold text-white">Student</h3>
          <p className="text-white/80">Job applications & interviews</p>
        </Link>
        <Link to="/login?role=staff" className="group bg-white/30 hover:bg-white/50 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105">
          <Users className="w-16 h-16 mx-auto mb-4 text-green-600 group-hover:rotate-6" />
          <h3 className="text-2xl font-bold text-white">Staff</h3>
          <p className="text-white/80">Student management</p>
        </Link>
        <Link to="/login?role=hr" className="group bg-white/30 hover:bg-white/50 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-orange-600 group-hover:rotate-6" />
          <h3 className="text-2xl font-bold text-white">HR</h3>
          <p className="text-white/80">Job postings & hiring</p>
        </Link>
        <Link to="/login?role=admin" className="group bg-white/30 hover:bg-white/50 p-8 rounded-2xl transition-all duration-300 transform hover:scale-105">
          <Shield className="w-16 h-16 mx-auto mb-4 text-purple-600 group-hover:rotate-6" />
          <h3 className="text-2xl font-bold text-white">Admin</h3>
          <p className="text-white/80">Full system control</p>
        </Link>
      </div>
      <Link to="/register" className="mt-8 inline-block text-white/90 hover:text-white underline">New user? Register here</Link>
    </div>
  </div>
);

export default RoleSelect;
