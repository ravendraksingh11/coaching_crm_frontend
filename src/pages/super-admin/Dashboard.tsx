import { useEffect, useState } from "react";

import {
  Building2,
  Users,
  UserCheck,
  CreditCard,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

import {
  getDashboard,
} from "../../api/superAdmin.api";

export default function Dashboard() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getDashboard();

      setData(result.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}

        <button
          onClick={loadDashboard}
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Institutes",
      value: data.totalInstitutes,
      icon: <Building2 />,
    },
    {
      title: "Active Institutes",
      value: data.activeInstitutes,
      icon: <Building2 />,
    },
    {
      title: "Total Students",
      value: data.totalStudents,
      icon: <Users />,
    },
    {
      title: "Total Teachers",
      value: data.totalTeachers,
      icon: <UserCheck />,
    },
    {
      title: "Active Subscriptions",
      value:
        data.activeSubscriptions,
      icon: <CreditCard />,
    },
    {
      title: "Revenue",
      value:
        `₹${Number(
          data.totalRevenue
        ).toLocaleString("en-IN")}`,
      icon: <IndianRupee />,
    },
  ];

  return (
    <div className="dashboard">

      <div className="page-header">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Welcome to Live Coach CRM
            Super Admin Panel
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadDashboard}
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>


      <div className="stats-grid">

        {stats.map(
          (stat) => (
            <div
              className="stat-card"
              key={stat.title}
            >

              <div className="stat-icon">
                {stat.icon}
              </div>

              <div>
                <p>
                  {stat.title}
                </p>

                <h2>
                  {stat.value}
                </h2>
              </div>

            </div>
          )
        )}

      </div>


      <div className="dashboard-section">

        <h2>
          Quick Actions
        </h2>

        <div className="quick-actions">

          <a href="/super-admin/institutes">
            Manage Institutes
          </a>

          <a href="/super-admin/plans">
            Subscription Plans
          </a>

        </div>

      </div>

    </div>
  );
}