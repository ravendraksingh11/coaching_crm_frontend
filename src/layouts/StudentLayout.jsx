import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ClipboardList, LogOut } from "lucide-react";

export default function StudentLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }
  return <div className="admin-layout">
    <aside className="sidebar">
      <div className="logo">Coaching SaaS</div>
      <div className="role">STUDENT</div>
      <nav><NavLink to="/student/tests"><ClipboardList /><span>My Tests</span></NavLink></nav>
      <button className="logout" onClick={logout}><LogOut size={18} />Logout</button>
    </aside>
    <main className="main-content">
      <header className="topbar"><div>Student Portal</div><div>{user.name}</div></header>
      <div className="content"><Outlet /></div>
    </main>
  </div>;
}
