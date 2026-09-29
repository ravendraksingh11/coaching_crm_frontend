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
  receiveFee,
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

  async function markFeeReceived(fee) {
    const amount = window.prompt(`Amount received (balance ₹${Number(fee.balance).toFixed(2)}):`, Number(fee.balance).toFixed(2));
    if (amount === null) return;
    try {
      await receiveFee(fee.fee_id, { amount: Number(amount), paymentMethod: "CASH" });
      await loadDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Could not record the fee payment");
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
    {
      title: "One-time Pending",
      value: `₹${Number(data.fees?.summary?.ONE_TIME?.pendingAmount || 0).toLocaleString("en-IN")}`,
      icon: <CreditCard />,
    },
    {
      title: "Monthly Pending",
      value: `₹${Number(data.fees?.summary?.MONTHLY?.pendingAmount || 0).toLocaleString("en-IN")}`,
      icon: <CreditCard />,
    },
  ];

  const feeSummary = data.fees?.summary || {};
  const pendingFeeTotal = Number(feeSummary.ONE_TIME?.pendingAmount || 0) + Number(feeSummary.MONTHLY?.pendingAmount || 0);
  const receivedFeeTotal = Number(feeSummary.ONE_TIME?.receivedAmount || 0) + Number(feeSummary.MONTHLY?.receivedAmount || 0);
  const feeTotal = pendingFeeTotal + receivedFeeTotal;
  const pendingFeePercent = feeTotal ? pendingFeeTotal * 100 / feeTotal : 0;

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

      <div className="dashboard-card">
        <h2>Fee collection</h2>
        <div className="dashboard-grid">
          <div>
            <div aria-label={`Pending ${pendingFeePercent.toFixed(1)} percent, received ${(100 - pendingFeePercent).toFixed(1)} percent`} style={{ width: 180, height: 180, borderRadius: "50%", background: feeTotal ? `conic-gradient(#ef4444 0 ${pendingFeePercent}%, #22c55e ${pendingFeePercent}% 100%)` : "#e5e7eb", display: "grid", placeItems: "center" }}>
              <div style={{ width: 112, height: 112, borderRadius: "50%", background: "white", display: "grid", placeItems: "center", textAlign: "center" }}><strong>{feeTotal ? `${pendingFeePercent.toFixed(0)}% pending` : "No fees"}</strong></div>
            </div>
            <p><span style={{ color: "#ef4444" }}>●</span> Pending {`₹${pendingFeeTotal.toLocaleString("en-IN")}`}</p>
            <p><span style={{ color: "#22c55e" }}>●</span> Received {`₹${receivedFeeTotal.toLocaleString("en-IN")}`}</p>
          </div>
          {["ONE_TIME", "MONTHLY"].map((frequency) => {
            const label = frequency === "ONE_TIME" ? "One-time pending" : "Monthly pending";
            const records = frequency === "ONE_TIME" ? data.fees?.oneTimePending || [] : data.fees?.monthlyPending || [];
            return <section className="dashboard-card" key={frequency}>
              <h3>{label}</h3>
              <p>{data.fees?.summary?.[frequency]?.pendingCount || 0} fee items · ₹{Number(data.fees?.summary?.[frequency]?.pendingAmount || 0).toLocaleString("en-IN")} due</p>
              {records.length ? <div className="table-card"><table><thead><tr><th>Student</th><th>Due</th><th>Balance</th><th /></tr></thead><tbody>{records.map((fee) => <tr key={fee.fee_id}><td>{fee.student_name}<small>{fee.batch_name || fee.admission_number}</small></td><td>{fee.due_date ? String(fee.due_date).slice(0, 10) : "—"}</td><td>₹{Number(fee.balance).toLocaleString("en-IN")}</td><td><button type="button" onClick={() => markFeeReceived(fee)}>Receive</button></td></tr>)}</tbody></table></div> : <p>No pending fees.</p>}
            </section>;
          })}
        </div>
      </div>

      <br />
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
