import { Link } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen max-h-screen overflow-y-auto bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r border-blue-200 dark:border-blue-800 p-6">
      <h2 className="text-2xl font-bold mb-10 text-blue-900 dark:text-blue-100">GenAI</h2>
      <nav className="space-y-2 flex flex-col">
        <Link to={`/${user.role}`} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition">
          <Home size={20} /> Dashboard
        </Link>
        {user.role === 'hr' && (
          <>
            <Link to="/hr" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition font-semibold bg-blue-200 dark:bg-blue-800">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span> HR Dashboard
            </Link>
            <Link to="/hr/jobs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Jobs & Reqs
            </Link>
            <Link to="/hr/exams" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Exams (Connect to Student)
            </Link>
          </>
        )}
        {user.role === 'staff' && (
          <>
            <Link to="/staff" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition font-semibold bg-blue-200 dark:bg-blue-800">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Staff Dashboard
            </Link>
            <Link to="/staff/applications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Applications
            </Link>
            <Link to="/staff/exams" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800 transition">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span> Exams (Connect to Student)
            </Link>
          </>
        )}
        {/* Add more menu items here as needed */}
      </nav>
      <button
        onClick={logout}
        className="mt-10 flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition"
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
