import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    BookOpen,
    Layers,
    FileText,
    CalendarCheck,
    CreditCard,
    Settings,
    LogOut,
} from "lucide-react";

export default function InstituteLayout() {

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

    const menu = [
        {
            path: "/institute/dashboard",
            label: "Dashboard",
            icon: <LayoutDashboard />,
        },
        {
            path: "/institute/students",
            label: "Students",
            icon: <Users />,
        },
        {
            path: "/institute/courses",
            label: "Courses",
            icon: <BookOpen />,
        },
        {
            path: "/institute/batches",
            label: "Batches",
            icon: <Layers />,
        },
        {
            path: "/institute/attendance",
            label: "Attendance",
            icon: <CalendarCheck />,
        },
        {
            path: "/institute/tests",
            label: "Tests",
            icon: <FileText />,
        },
        {
            path: "/institute/subscription",
            label: "Subscription",
            icon: <CreditCard />,
        },
        {
            path: "/institute/settings",
            label: "Settings",
            icon: <Settings />,
        },
    ];

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            ) || "{}"
        );

    return (
        <div className="admin-layout">

            <aside className="sidebar">

                <div className="logo">
                    Live Coach CRM
                </div>

                <div className="role">
                    INSTITUTE ADMIN
                </div>

                <nav>

                    {menu.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                        >

                            {item.icon}

                            <span>
                                {item.label}
                            </span>

                        </NavLink>

                    ))}

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
                        Institute Admin
                    </div>

                    <div>
                        {user.name}
                    </div>

                </header>

                <div className="content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}
