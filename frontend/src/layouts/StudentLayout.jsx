import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/student/StudentSidebar";
import StudentTopbar from "../components/student/StudentTopbar";

export default function StudentLayout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar />
        <main className="p-8 overflow-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
