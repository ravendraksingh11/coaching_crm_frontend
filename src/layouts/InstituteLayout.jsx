import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    UserCheck,
    UserRound,
    BookOpen,
    Layers,
    IndianRupee,
    CalendarCheck,
    FileText,
    Trophy,
    FolderOpen,
    Bell,
    BarChart3,
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
            path: "/institute/parents",
            label: "Parents",
            icon: <UserRound />,
        },
        {
            path: "/institute/teachers",
            label: "Teachers",
            icon: <UserCheck />,
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
            path: "/institute/fees",
            label: "Fees",
            icon: <IndianRupee />,
        },
        {
            path: "/institute/payments",
            label: "Payments",
            icon: <IndianRupee />,
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
            path: "/institute/results",
            label: "Results",
            icon: <Trophy />,
        },
        {
            path: "/institute/materials",
            label: "Study Material",
            icon: <FolderOpen />,
        },
        {
            path: "/institute/notifications",
            label: "Notifications",
            icon: <Bell />,
        },
        {
            path: "/institute/reports",
            label: "Reports",
            icon: <BarChart3 />,
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
                    Coaching SaaS
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