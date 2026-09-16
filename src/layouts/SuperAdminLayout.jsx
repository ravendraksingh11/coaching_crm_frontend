import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    Building2,
    CreditCard,
    LogOut,
} from "lucide-react";

export default function SuperAdminLayout() {

    const navigate =
        useNavigate();

    function logout() {
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate("/login");
    }

    return (
        <div className="admin-layout">

            <aside className="sidebar">

                <div className="logo">
                    Coaching SaaS
                </div>

                <div className="role">
                    SUPER ADMIN
                </div>

                <nav>

                    <NavLink
                        to="/super-admin/dashboard"
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/super-admin/institutes"
                    >
                        <Building2 size={18} />
                        Institutes
                    </NavLink>

                    <NavLink
                        to="/super-admin/plans"
                    >
                        <CreditCard size={18} />
                        Subscription Plans
                    </NavLink>

                </nav>


                <button
                    className="logout"
                    onClick={logout}
                >
                    <LogOut size={18} />
                    Logout
                </button>

            </aside>


            <main className="main-content">

                <header className="topbar">

                    <div>
                        Super Admin Panel
                    </div>

                    <div>
                        {JSON.parse(
                            localStorage.getItem(
                                "user"
                            ) || "{}"
                        ).name}
                    </div>

                </header>


                <div className="content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}