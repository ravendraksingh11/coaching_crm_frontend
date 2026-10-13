import { useEffect, useState } from "react";

import {
  getInstitutes,
  createInstitute,
  updateInstitute,
  updateInstituteStatus,
  deleteInstitute,
} from "../../api/superAdmin.api";
import DataTable from "../../components/DataTable";

export default function Institutes() {

  const [institutes, setInstitutes] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",

      adminName: "",
      adminEmail: "",
      adminPhone: "",
      adminPassword: "",
    });

  async function loadInstitutes() {
    try {
      const result =
        await getInstitutes();

      setInstitutes(result.data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadInstitutes();
  }, []);


  function updateField(
    e
  ) {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  }


  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await createInstitute(form);

      alert(
        "Institute created successfully"
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",

        adminName: "",
        adminEmail: "",
        adminPhone: "",
        adminPassword: "",
      });

      setShowForm(false);

      await loadInstitutes();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create institute"
      );
    } finally {
      setLoading(false);
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
      key: "location",
      header: "Location",
      value: (institute) =>
        `${institute.city || ""}${institute.state ? `, ${institute.state}` : ""}`,
    },
    {
      key: "students",
      header: "Students",
      value: (institute) => institute.student_count,
    },
    {
      key: "teachers",
      header: "Teachers",
      value: (institute) => institute.teacher_count,
    },
    {
      key: "plan",
      header: "Plan",
      value: (institute) => institute.plan_name || "No Plan",
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
      key: "actions",
      header: "Actions",
      searchable: false,
      sortable: false,
      value: () => "",
      render: (institute) => (
        <div className="action-row">
          <button type="button" className="secondary-button" onClick={async () => {
            const name = window.prompt("Institute name", institute.name);
            if (name === null) return;
            try {
              await updateInstitute(institute.id, { name });
              await loadInstitutes();
            } catch (error) {
              alert(error.response?.data?.message || "Could not update institute");
            }
          }}>Edit name</button>
          <button type="button" className="secondary-button" onClick={async () => {
            const status = institute.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
            try {
              await updateInstituteStatus(institute.id, status);
              await loadInstitutes();
            } catch (error) {
              alert(error.response?.data?.message || "Could not update status");
            }
          }}>{institute.status === "SUSPENDED" ? "Restore" : "Suspend"}</button>
          <button type="button" className="danger-button" onClick={async () => {
            if (!window.confirm(`Delete ${institute.name} and its tenant data?`)) return;
            try {
              await deleteInstitute(institute.id);
              await loadInstitutes();
            } catch (error) {
              alert(error.response?.data?.message || "Could not delete institute");
            }
          }}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>
            Institutes
          </h1>

          <p>
            Manage all coaching institutes
          </p>
        </div>

        <button
          onClick={() =>
            setShowForm(
              !showForm
            )
          }
        >
          + Create Institute
        </button>

      </div>


      {showForm && (

        <div className="form-card">

          <h2>
            Create Institute
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >

            <h3>
              Institute Details
            </h3>

            <div className="form-grid">

              <input
                name="name"
                placeholder="Institute Name"
                value={form.name}
                onChange={
                  updateField
                }
                required
              />

              <input
                name="email"
                placeholder="Institute Email"
                value={form.email}
                onChange={
                  updateField
                }
              />

              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={
                  updateField
                }
              />

              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={
                  updateField
                }
              />

              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={
                  updateField
                }
              />

              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={
                  updateField
                }
              />

            </div>


            <h3>
              Institute Admin
            </h3>

            <div className="form-grid">

              <input
                name="adminName"
                placeholder="Admin Name"
                value={
                  form.adminName
                }
                onChange={
                  updateField
                }
                required
              />

              <input
                name="adminEmail"
                type="email"
                placeholder="Admin Email"
                value={
                  form.adminEmail
                }
                onChange={
                  updateField
                }
                required
              />

              <input
                name="adminPhone"
                placeholder="Admin Phone"
                value={
                  form.adminPhone
                }
                onChange={
                  updateField
                }
              />

              <input
                name="adminPassword"
                type="password"
                placeholder="Admin Password"
                value={
                  form.adminPassword
                }
                onChange={
                  updateField
                }
                required
              />

            </div>


            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Institute"}
            </button>

          </form>

        </div>

      )}


      <DataTable
        columns={columns}
        rows={institutes}
        rowKey={(institute) => institute.id}
        emptyMessage="No institutes found."
        searchPlaceholder="Search institutes..."
      />

    </div>
  );
}
