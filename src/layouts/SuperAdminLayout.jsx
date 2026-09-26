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

    const nav = [{
        title: 'Dashboard',
        route: '/super-admin/dashboard',
        icon: <LayoutDashboard size={18} />

    },
    {
        title: 'Institutes',
        route: '/super-admin/institutes',
        icon: <Building2 size={18} />
    }, {
        title: 'Plans',
        route: "/super-admin/plans",
        icon: <CreditCard size={18} />

    },
    {
        title: 'Subscription Plans',
        route: "/super-admin/subscriptions",
        icon: <CreditCard size={18} />
    },
    ]

    return (
        <div className="admin-layout">

            <aside className="sidebar">

                <div className="logo">
                    Live Coach CRM
                </div>

                <div className="role">
                    SUPER ADMIN
                </div>

                <nav>
                    {nav?.map(item => {
                        return <NavLink
                            to={item?.route}
                        >
                            {item?.icon}
                            {item?.title}
                        </NavLink>
                    })}


                    {/* <NavLink
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
                    </NavLink> */}

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