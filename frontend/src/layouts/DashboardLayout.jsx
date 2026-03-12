import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";

const DashboardLayout = ({ children }) => {
  return (
<div className="min-h-screen flex bg-background dark:bg-backgroundDark text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
