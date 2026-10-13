import { useEffect, useState } from "react";
import {
  getInstitutes,
  getPlans,
  assignLegacySubscription,
} from "../../api/superAdmin.api";
import DataTable from "../../components/DataTable";

export default function Subscriptions() {
  const [institutes, setInstitutes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [planByInstitute, setPlanByInstitute] = useState({});
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [i, p] = await Promise.all([getInstitutes(), getPlans()]);
      setInstitutes(i.data || []);
      setPlans((p.data || []).filter((x) => x.is_active));
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not load institutes and plans",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function assign(id) {
    if (!planByInstitute[id]) {
      setError("Choose an active plan first.");
      return;
    }
    try {
      setSaving(id);
      setError("");
      await assignLegacySubscription(id, {
        planId: planByInstitute[id],
        startDate,
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not assign plan");
    } finally {
      setSaving("");
    }
  }

  const columns = [
    {
      key: "institute",
      header: "Institute",
      value: (institute) => institute.name,
      render: (institute) => (
        <>
          <strong>{institute.name}</strong>
          <small>{institute.email}</small>
        </>
      ),
    },
    {
      key: "plan",
      header: "Current plan",
      value: (institute) => institute.plan_name || "No plan",
    },
    {
      key: "status",
      header: "Status",
      value: (institute) => institute.status,
      render: (institute) => (
        <span className={`status ${(institute.status || "").toLowerCase()}`}>
          {institute.status}
        </span>
      ),
    },
    {
      key: "assign_plan",
      header: "Assign active plan",
      sortable: false,
      value: () => "",
      render: (institute) => (
        <select
          value={planByInstitute[institute.id] || ""}
          onChange={(event) =>
            setPlanByInstitute((value) => ({
              ...value,
              [institute.id]: event.target.value,
            }))
          }
        >
          <option value="">Select plan</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · ₹{plan.price}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "start_date",
      header: "Start date",
      sortable: false,
      searchable: false,
      value: () => "",
      render: () => (
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      ),
    },
    {
      key: "action",
      header: "Action",
      sortable: false,
      searchable: false,
      value: () => "",
      render: (institute) => (
        <button
          disabled={saving === institute.id || !plans.length}
          onClick={() => assign(institute.id)}
        >
          {saving === institute.id ? "Assigning…" : "Assign"}
        </button>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Institute subscriptions</h1>
          <p>Assign or replace an institute plan.</p>
        </div>
        <button onClick={load}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="page-loading">Loading subscriptions…</div>
      ) : (
        <DataTable
          columns={columns}
          rows={institutes}
          rowKey={(institute) => institute.id}
          emptyMessage="No institutes found."
          searchPlaceholder="Search institutes..."
        />
      )}
    </div>
  );
}
