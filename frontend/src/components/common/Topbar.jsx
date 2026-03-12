import { User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";

const Topbar = () => {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <header
      className="
        h-16 px-6 flex items-center justify-between
        bg-white dark:bg-black
        border-b border-gray-200 dark:border-gray-800
      "
    >
      {/* Left: Page Title */}
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h1>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="
            px-3 py-2 rounded-lg
            bg-gray-200 dark:bg-gray-800
            text-gray-800 dark:text-gray-200
            hover:opacity-80 transition
          "
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <User size={18} />
          <span className="text-sm font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
