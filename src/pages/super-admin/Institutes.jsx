import { useEffect, useState } from "react";

import {
  getInstitutes,
  createInstitute,
} from "../../api/superAdmin.api";

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

      setInstitutes(
        result.data
      );
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

      loadInstitutes();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to create institute"
      );
    } finally {
      setLoading(false);
    }
  }


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


      <div className="table-card">

        <table>

          <thead>

            <tr>
              <th>Institute</th>
              <th>Location</th>
              <th>Students</th>
              <th>Teachers</th>
              <th>Plan</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {institutes.map(
              (institute) => (

                <tr
                  key={
                    institute.id
                  }
                >

                  <td>
                    <strong>
                      {institute.name}
                    </strong>

                    <small>
                      {institute.email}
                    </small>
                  </td>

                  <td>
                    {institute.city}
                    {institute.state
                      ? `, ${institute.state}`
                      : ""}
                  </td>

                  <td>
                    {
                      institute.student_count
                    }
                  </td>

                  <td>
                    {
                      institute.teacher_count
                    }
                  </td>

                  <td>
                    {
                      institute.plan_name ||
                      "No Plan"
                    }
                  </td>

                  <td>
                    <span
                      className={
                        `status ${institute.status.toLowerCase()}`
                      }
                    >
                      {
                        institute.status
                      }
                    </span>
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