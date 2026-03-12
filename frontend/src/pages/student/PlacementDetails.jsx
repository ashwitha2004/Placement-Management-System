import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, Users, Award, DollarSign, MapPin, Calendar, Briefcase, Target, CheckCircle, Clock, Filter, Download, Search, BarChart3 } from 'lucide-react';
import { placementsAPI } from '../../services/api';

const PlacementDetails = () => {
  const [placements, setPlacements] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartView, setChartView] = useState('companies'); // companies, packages, branches

  useEffect(() => {
    fetchPlacements();
    fetchStatistics();
  }, [selectedYear, selectedBranch]);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const response = await placementsAPI.getAll({ year: selectedYear, branch: selectedBranch });
        const apiPlacements = response.data.placements || [];
        const normalizedPlacements = apiPlacements.map((placement) => ({
          id: placement._id || placement.id,
          studentName: placement.studentUser?.name || placement.studentName || 'N/A',
          rollNumber: placement.student?.rollNumber || placement.rollNumber || 'N/A',
          branch: placement.student?.branch || placement.branch || 'N/A',
          cgpa: placement.student?.cgpa ?? placement.cgpa,
          company: placement.companyName || placement.company || 'N/A',
          role: placement.roleTitle || placement.role || 'N/A',
          package: placement.ctc || placement.package,
          location: placement.location || 'N/A',
          placementDate: placement.resultDate || placement.placementDate,
          joiningDate: placement.joiningDate,
          type: placement.offerType || placement.type || 'N/A',
          offCampus: placement.offCampus ?? false
        }));
        setPlacements(normalizedPlacements.length ? normalizedPlacements : mockPlacements);
    } catch (error) {
      console.error('Error fetching placements:', error);
      setPlacements(mockPlacements);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Mock statistics - replace with actual API call
      setStatistics(mockStatistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(mockStatistics);
    }
  };

  const mockPlacements = [
    {
      id: 1,
      studentName: 'Rajesh Kumar',
      rollNumber: 'CS2022001',
      branch: 'CSE',
      cgpa: 9.2,
      company: 'Google',
      role: 'Software Engineer',
      package: 5200000,
      location: 'Bangalore',
      placementDate: new Date('2026-01-15'),
      joiningDate: new Date('2026-07-01'),
      type: 'Full-Time',
      offCampus: false
    },
    {
      id: 2,
      studentName: 'Priya Sharma',
      rollNumber: 'CS2022045',
      branch: 'CSE',
      cgpa: 8.9,
      company: 'Microsoft',
      role: 'SDE-1',
      package: 4500000,
      location: 'Hyderabad',
      placementDate: new Date('2026-01-18'),
      joiningDate: new Date('2026-08-01'),
      type: 'Full-Time',
      offCampus: false
    },
    {
      id: 3,
      studentName: 'Amit Patel',
      rollNumber: 'ECE2022012',
      branch: 'ECE',
      cgpa: 8.7,
      company: 'Amazon',
      role: 'SDE-1',
      package: 4200000,
      location: 'Bangalore',
      placementDate: new Date('2026-01-22'),
      joiningDate: new Date('2026-07-15'),
      type: 'Full-Time',
      offCampus: false
    },
    {
      id: 4,
      studentName: 'Sneha Reddy',
      rollNumber: 'CSE2022078',
      branch: 'CSE',
      cgpa: 9.5,
      company: 'Apple',
      role: 'Software Engineer',
      package: 5800000,
      location: 'Cupertino, USA',
      placementDate: new Date('2026-01-25'),
      joiningDate: new Date('2026-09-01'),
      type: 'Full-Time',
      offCampus: true
    },
    {
      id: 5,
      studentName: 'Vikram Singh',
      rollNumber: 'ME2022034',
      branch: 'Mechanical',
      cgpa: 8.4,
      company: 'TCS',
      role: 'Assistant System Engineer',
      package: 350000,
      location: 'Mumbai',
      placementDate: new Date('2026-02-01'),
      joiningDate: new Date('2026-07-01'),
      type: 'Full-Time',
      offCampus: false
    },
    {
      id: 6,
      studentName: 'Ananya Iyer',
      rollNumber: 'CSE2022089',
      branch: 'CSE',
      cgpa: 8.8,
      company: 'Infosys',
      role: 'Systems Engineer',
      package: 380000,
      location: 'Pune',
      placementDate: new Date('2026-02-03'),
      joiningDate: new Date('2026-08-01'),
      type: 'Full-Time',
      offCampus: false
    },
    {
      id: 7,
      studentName: 'Karthik Menon',
      rollNumber: 'EEE2022056',
      branch: 'Electrical',
      cgpa: 8.6,
      company: 'Wipro',
      role: 'Project Engineer',
      package: 360000,
      location: 'Bangalore',
      placementDate: new Date('2026-02-05'),
      joiningDate: new Date('2026-07-15'),
      type: 'Full-Time',
      offCampus: false
    },
    {
      id: 8,
      studentName: 'Divya Nair',
      rollNumber: 'CSE2022120',
      branch: 'CSE',
      cgpa: 9.1,
      company: 'Accenture',
      role: 'Application Development Associate',
      package: 450000,
      location: 'Chennai',
      placementDate: new Date('2026-02-07'),
      joiningDate: new Date('2026-08-01'),
      type: 'Full-Time',
      offCampus: false
    }
  ];

  const mockStatistics = {
    totalPlaced: 456,
    totalStudents: 600,
    placementPercentage: 76,
    highestPackage: 5800000,
    averagePackage: 650000,
    companiesVisited: 85,
    offersReceived: 523,
    dreamOffersCount: 45,
    superDreamOffersCount: 12,
    topRecruiters: [
      { company: 'TCS', count: 78 },
      { company: 'Infosys', count: 65 },
      { company: 'Wipro', count: 54 },
      { company: 'Accenture', count: 42 },
      { company: 'Cognizant', count: 38 }
    ],
    branchWiseStats: [
      { branch: 'CSE', placed: 145, total: 180, percentage: 81 },
      { branch: 'ECE', placed: 98, total: 120, percentage: 82 },
      { branch: 'Mechanical', placed: 87, total: 110, percentage: 79 },
      { branch: 'Electrical', placed: 76, total: 100, percentage: 76 },
      { branch: 'Civil', placed: 50, total: 90, percentage: 56 }
    ],
    packageDistribution: [
      { range: '3-5 LPA', count: 245 },
      { range: '5-8 LPA', count: 125 },
      { range: '8-12 LPA', count: 58 },
      { range: '12-20 LPA', count: 23 },
      { range: '20+ LPA', count: 5 }
    ]
  };

  const formatCurrency = (amount) => {
    const value = Number(amount);
    if (!Number.isFinite(value)) return 'N/A';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} LPA`;
    return `₹${value.toLocaleString()}`;
  };

  const getFilteredPlacements = () => {
    let filtered = placements;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const renderStatistics = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users size={28} />
            <div className="text-right">
              <p className="text-3xl font-bold">{statistics.totalPlaced}</p>
              <p className="text-sm opacity-90">/{statistics.totalStudents}</p>
            </div>
          </div>
          <p className="text-sm font-semibold">Students Placed</p>
          <div className="mt-2 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2"
              style={{ width: `${statistics.placementPercentage}%` }}
            />
          </div>
          <p className="text-xs mt-1">{statistics.placementPercentage}% Placement Rate</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={28} />
            <p className="text-3xl font-bold">{formatCurrency(statistics.highestPackage)}</p>
          </div>
          <p className="text-sm font-semibold">Highest Package</p>
          <p className="text-xs mt-2 opacity-90">Average: {formatCurrency(statistics.averagePackage)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Building2 size={28} />
            <p className="text-3xl font-bold">{statistics.companiesVisited}</p>
          </div>
          <p className="text-sm font-semibold">Companies Visited</p>
          <p className="text-xs mt-2 opacity-90">{statistics.offersReceived} offers received</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Award size={28} />
            <div className="text-right">
              <p className="text-3xl font-bold">{statistics.dreamOffersCount}</p>
            </div>
          </div>
          <p className="text-sm font-semibold">Dream Offers</p>
          <p className="text-xs mt-2 opacity-90">{statistics.superDreamOffersCount} Super Dream Offers</p>
        </div>
      </div>
    );
  };

  const renderTopRecruiters = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Building2 size={24} />
          Top Recruiters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {statistics.topRecruiters?.map((recruiter, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">#{index + 1}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{recruiter.company}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{recruiter.count}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">students placed</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBranchWiseStats = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BarChart3 size={24} />
          Branch-wise Placement Statistics
        </h2>
        <div className="space-y-4">
          {statistics.branchWiseStats?.map((branch, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{branch.branch}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {branch.placed} placed out of {branch.total} students
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{branch.percentage}%</p>
                </div>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-3 transition-all"
                  style={{ width: `${branch.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPackageDistribution = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp size={24} />
          Package Distribution
        </h2>
        <div className="space-y-3">
          {statistics.packageDistribution?.map((pkg, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {pkg.range}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-8 flex items-center justify-end pr-3 transition-all"
                    style={{ width: `${(pkg.count / statistics.totalPlaced) * 100}%` }}
                  >
                    <span className="text-white font-bold text-sm">{pkg.count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlacementsList = () => {
    const filteredPlacements = getFilteredPlacements();

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Briefcase size={24} />
          Recent Placements
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Branch</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">CGPA</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Package</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlacements.slice(0, 10).map((placement) => (
                <tr key={placement.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{placement.studentName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{placement.rollNumber}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{placement.branch}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-semibold text-sm">
                      {placement.cgpa}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{placement.company}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{placement.role}</td>
                  <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(placement.package)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{placement.location}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      placement.offCampus
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {placement.offCampus ? 'Off-Campus' : 'On-Campus'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Placement Details</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search students, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="2026">2025-26</option>
            <option value="2025">2024-25</option>
            <option value="2024">2023-24</option>
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electrical">Electrical</option>
            <option value="Civil">Civil</option>
          </select>
        </div>
      </div>

      {renderStatistics()}
      {renderTopRecruiters()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderBranchWiseStats()}
        {renderPackageDistribution()}
      </div>

      {renderPlacementsList()}
    </div>
  );
};

export default PlacementDetails;
