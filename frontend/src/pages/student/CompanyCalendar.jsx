import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, MapPin, Users, ChevronLeft, ChevronRight, Filter, Download, Bell, Search, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const CompanyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // month, week, list
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanyEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filterCategory, searchQuery]);

  const fetchCompanyEvents = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockEvents = [
        {
          id: 1,
          title: 'Google Campus Drive',
          company: 'Google',
          date: new Date(2026, 1, 10, 10, 0),
          endDate: new Date(2026, 1, 10, 17, 0),
          type: 'Campus Drive',
          location: 'Main Auditorium',
          eligibility: 'CGPA > 7.5',
          status: 'Upcoming',
          registrationDeadline: new Date(2026, 1, 8),
          description: 'Google is hiring for Software Engineering roles',
          slots: 200,
          registered: 145,
          color: 'blue'
        },
        {
          id: 2,
          title: 'Microsoft Pre-Placement Talk',
          company: 'Microsoft',
          date: new Date(2026, 1, 12, 14, 0),
          endDate: new Date(2026, 1, 12, 16, 0),
          type: 'Pre-Placement Talk',
          location: 'Seminar Hall 1',
          eligibility: 'All Final Year',
          status: 'Upcoming',
          registrationDeadline: new Date(2026, 1, 11),
          description: 'Learn about opportunities at Microsoft',
          slots: 150,
          registered: 120,
          color: 'green'
        },
        {
          id: 3,
          title: 'Amazon Online Assessment',
          company: 'Amazon',
          date: new Date(2026, 1, 15, 9, 0),
          endDate: new Date(2026, 1, 15, 12, 0),
          type: 'Online Test',
          location: 'Online',
          eligibility: 'CGPA > 7.0',
          status: 'Registration Open',
          registrationDeadline: new Date(2026, 1, 13),
          description: 'Online coding assessment for SDE positions',
          slots: 300,
          registered: 267,
          color: 'orange'
        },
        {
          id: 4,
          title: 'TCS Mass Recruitment',
          company: 'TCS',
          date: new Date(2026, 1, 18, 8, 0),
          endDate: new Date(2026, 1, 18, 18, 0),
          type: 'Campus Drive',
          location: 'Main Campus',
          eligibility: 'CGPA > 6.0',
          status: 'Upcoming',
          registrationDeadline: new Date(2026, 1, 16),
          description: 'TCS National Qualifier Test and Interviews',
          slots: 500,
          registered: 423,
          color: 'purple'
        },
        {
          id: 5,
          title: 'Infosys Technical Interview',
          company: 'Infosys',
          date: new Date(2026, 1, 20, 10, 0),
          endDate: new Date(2026, 1, 20, 16, 0),
          type: 'Interview',
          location: 'Building B, Rooms 201-205',
          eligibility: 'Selected Candidates',
          status: 'Scheduled',
          registrationDeadline: new Date(2026, 1, 19),
          description: 'Technical round for shortlisted candidates',
          slots: 50,
          registered: 50,
          color: 'indigo'
        },
        {
          id: 6,
          title: 'Wipro HR Round',
          company: 'Wipro',
          date: new Date(2026, 1, 22, 11, 0),
          endDate: new Date(2026, 1, 22, 15, 0),
          type: 'Interview',
          location: 'Conference Room 3',
          eligibility: 'Cleared Tech Round',
          status: 'Scheduled',
          registrationDeadline: new Date(2026, 1, 21),
          description: 'Final HR interview round',
          slots: 30,
          registered: 28,
          color: 'red'
        },
        {
          id: 7,
          title: 'Accenture Assessment Day',
          company: 'Accenture',
          date: new Date(2026, 1, 25, 9, 0),
          endDate: new Date(2026, 1, 25, 17, 0),
          type: 'Campus Drive',
          location: 'Computer Lab 1 & 2',
          eligibility: 'CGPA > 6.5',
          status: 'Registration Open',
          registrationDeadline: new Date(2026, 1, 23),
          description: 'Complete assessment including aptitude and coding',
          slots: 250,
          registered: 198,
          color: 'pink'
        },
        {
          id: 8,
          title: 'Cognizant GenC Next',
          company: 'Cognizant',
          date: new Date(2026, 1, 28, 10, 0),
          endDate: new Date(2026, 1, 28, 16, 0),
          type: 'Campus Drive',
          location: 'Main Auditorium',
          eligibility: 'All Branches, CGPA > 6.0',
          status: 'Upcoming',
          registrationDeadline: new Date(2026, 1, 26),
          description: 'GenC Next program for fresher recruitment',
          slots: 400,
          registered: 312,
          color: 'yellow'
        }
      ];
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.type === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Week day headers
    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-bold text-gray-600 dark:text-gray-400 py-2">
          {day}
        </div>
      );
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`p-2 border border-gray-200 dark:border-gray-700 min-h-[100px] cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
            isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
          } ${isToday ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate bg-${event.color}-100 dark:bg-${event.color}-900/30 text-${event.color}-800 dark:text-${event.color}-300 border-l-2 border-${event.color}-500`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderListView = () => {
    const today = new Date();
    const upcomingEvents = filteredEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <div className="space-y-4">
        {upcomingEvents.map(event => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${event.color}-100 dark:bg-${event.color}-900/30 text-${event.color}-700 dark:text-${event.color}-300`}>
                    {event.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    event.status === 'Registration Open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    event.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Building2 size={16} className="text-gray-500" />
                    <span>{event.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Clock size={16} className="text-gray-500" />
                    <span>{new Date(event.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Users size={16} className="text-gray-500" />
                    <span>{event.registered}/{event.slots} registered</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">Eligibility: <span className="font-semibold">{event.eligibility}</span></span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <AlertCircle size={16} className="text-orange-600" />
                  <span className="text-gray-700 dark:text-gray-300">Registration Deadline: <span className="font-semibold">{new Date(event.registrationDeadline).toLocaleDateString()}</span></span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm">
                  Register
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold text-sm">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Company Calendar</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Bell size={18} />
            Set Reminders
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search companies, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Events</option>
              <option value="Campus Drive">Campus Drives</option>
              <option value="Pre-Placement Talk">Pre-Placement Talks</option>
              <option value="Online Test">Online Tests</option>
              <option value="Interview">Interviews</option>
            </select>

            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-md transition-all ${view === 'month' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                Month
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md transition-all ${view === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'month' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {renderCalendar()}
          </div>

          {selectedDate && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{event.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {event.location}
                          </p>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No events scheduled for this date.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        renderListView()
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
          <p className="text-3xl font-bold">{filteredEvents.filter(e => new Date(e.date) > new Date()).length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Companies Visiting</h3>
          <p className="text-3xl font-bold">{new Set(events.map(e => e.company)).size}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Open Registrations</h3>
          <p className="text-3xl font-bold">{events.filter(e => e.status === 'Registration Open').length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total Slots</h3>
          <p className="text-3xl font-bold">{events.reduce((acc, e) => acc + e.slots, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyCalendar;
