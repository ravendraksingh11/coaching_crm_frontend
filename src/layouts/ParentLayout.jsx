import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarCheck, LogOut } from "lucide-react";

export default function ParentLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }
  return <div className="admin-layout"><aside className="sidebar"><div className="logo">Live Coach CRM</div><div className="role">PARENT</div><nav><NavLink to="/parent/attendance"><CalendarCheck /><span>Attendance</span></NavLink></nav><button className="logout" onClick={logout}><LogOut size={18} />Logout</button></aside><main className="main-content"><header className="topbar"><div>Parent Portal</div><div>{user.name}</div></header><div className="content"><Outlet /></div></main></div>;
}
