import React from 'react';
import { Bell, X } from 'lucide-react';

const NotificationModal = ({ show, onClose, notifications, setNotifications, theme }) => {
  if (!show) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl border max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 p-8 border-b backdrop-blur-xl flex justify-between items-center ${
          isDark ? 'bg-gradient-to-b from-slate-900 to-slate-900/80 border-white/10' : 'bg-gradient-to-b from-white to-white/80 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <Bell className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={24} />
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
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

        {/* Content */}
        <div className="p-8 space-y-3">
          {notifications.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">No notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.read 
                    ? (isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')
                    : (isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100')
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    notif.read ? 'bg-transparent' : 'bg-indigo-500'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {notif.message}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {notif.time}
                    </p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => {
                        setNotifications(notifications.map(n => 
                          n.id === notif.id ? { ...n, read: true } : n
                        ));
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          
          {notifications.length > 0 && (
            <button
              onClick={() => {
                setNotifications(notifications.map(n => ({ ...n, read: true })));
              }}
              className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
