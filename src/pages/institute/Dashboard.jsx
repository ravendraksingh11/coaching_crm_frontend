import { Link } from "react-router-dom";
import {
  useEffect,
  useState,
} from "react";

import {
  Users,
  UserCheck,
  UserRound,
  BookOpen,
  Layers,
  CreditCard,
  FileText,
  CalendarCheck,
  RefreshCw,
} from "lucide-react";

import {
  getDashboard,
} from "../../api/institute.api";

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

      const result =
        await getDashboard();

      setData(result.data);
      setError("");
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
      </div>
    );
  }

  const stats = [
    {
      title: "Students",
      value: data.stats.students,
      icon: <Users />,
    },
    {
      title: "Teachers",
      value: data.stats.teachers,
      icon: <UserCheck />,
    },
    {
      title: "Parents",
      value: data.stats.parents,
      icon: <UserRound />,
    },
    {
      title: "Courses",
      value: data.stats.courses,
      icon: <BookOpen />,
    },
    {
      title: "Batches",
      value: data.stats.batches,
      icon: <Layers />,
    },
    {
      title: "Tests",
      value: data.stats.tests,
      icon: <FileText />,
    },
    {
      title: "Pending Fees",
      value:
        `₹${data.stats.pendingFees
          .toLocaleString("en-IN")}`,
      icon: <CreditCard />,
    },
  ];

  const attendance =
    data.attendance;

  const attendancePercentage =
    attendance.total > 0
      ? Math.round(
        (attendance.present /
          attendance.total) *
        100
      )
      : 0;

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>
            Institute Dashboard
          </h1>

          <p>
            Overview of your coaching institute
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={
            loadDashboard
          }
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>


      <div className="stats-grid">

        {stats.map((item) => (
          <div
            className="stat-card"
            key={item.title}
          >

            <div className="stat-icon">
              {item.icon}
            </div>

            <div>
              <p>
                {item.title}
              </p>

              <h2>
                {item.value}
              </h2>
            </div>

          </div>
        ))}

      </div>


      <div className="dashboard-card"><h2>Attendance</h2><p>Schedule class sessions and take batch attendance.</p><Link className="button-link" to="/institute/attendance">Manage attendance</Link></div>

      <div className="dashboard-card"><h2>Tests</h2><p>Create tests, review questions, and manage assignments.</p><Link className="button-link" to="/institute/tests">Manage tests</Link></div>

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="card-header">

            <h2>
              Today's Attendance
            </h2>

            <CalendarCheck />

          </div>

          <div className="attendance-number">
            {attendancePercentage}%
          </div>

          <p>
            Present:{" "}
            <strong>
              {attendance.present}
            </strong>
          </p>

          <p>
            Absent:{" "}
            <strong>
              {attendance.absent}
            </strong>
          </p>

          <p>
            Total:{" "}
            <strong>
              {attendance.total}
            </strong>
          </p>

        </div>


        <div className="dashboard-card">

          <div className="card-header">

            <h2>
              Subscription
            </h2>

            <CreditCard />

          </div>

          {data.subscription ? (

            <>
              <h3>
                {data.subscription.plan_name}
              </h3>

              <p>
                Student limit:{" "}
                <strong>
                  {
                    data.subscription
                      .student_limit
                  }
                </strong>
              </p>

              <p>
                Current students:{" "}
                <strong>
                  {data.stats.students}
                </strong>
              </p>

              <p>
                Valid until:{" "}
                <strong>
                  {new Date(
                    data.subscription.end_date
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </strong>
              </p>
            </>

          ) : (

            <p>
              No active subscription
            </p>

          )}

        </div>

      </div>


      <div className="dashboard-card">

        <div className="card-header">

          <h2>
            Recent Students
          </h2>

        </div>

        <table>

          <thead>
            <tr>
              <th>
                Name
              </th>

              <th>
                Admission No.
              </th>

              <th>
                Created
              </th>
            </tr>
          </thead>

          <tbody>

            {data.recentStudents.map(
              (student) => (

                <tr
                  key={student.id}
                >

                  <td>
                    {student.name}
                  </td>

                  <td>
                    {
                      student.admission_number
                    }
                  </td>

                  <td>
                    {new Date(
                      student.created_at
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      <div className="dashboard-card">

        <div className="card-header">

          <h2>
            Recent Payments
          </h2>

        </div>

        <table>

          <thead>
            <tr>
              <th>
                Student
              </th>

              <th>
                Amount
              </th>

              <th>
                Date
              </th>
            </tr>
          </thead>

          <tbody>

            {data.recentPayments.map(
              (payment) => (

                <tr
                  key={payment.id}
                >

                  <td>
                    {
                      payment.student_name
                    }
                  </td>

                  <td>
                    ₹
                    {Number(
                      payment.amount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>
                    {new Date(
                      payment.payment_date
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}