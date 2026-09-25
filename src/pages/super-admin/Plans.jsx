import {
  useEffect,
  useState,
} from "react";

import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../api/superAdmin.api";

export default function Plans() {

  const [plans, setPlans] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] =
    useState({
      name: "",
      description: "",
      price: "",
      durationMonths: 1,
      studentLimit: "",
      teacherLimit: 10,
    });


  async function loadPlans() {
    try {
      const result =
        await getPlans();

      setPlans(result.data || []);
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    loadPlans();
  }, []);


  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  }


  async function handleSubmit(e) {
    e.preventDefault();

    try {

      const payload = {
        ...form,

        price:
          Number(form.price),

        durationMonths:
          Number(
            form.durationMonths
          ),

        studentLimit:
          Number(
            form.studentLimit
          ),

        teacherLimit:
          Number(
            form.teacherLimit
          ),
      };
      if (editing) await updatePlan(editing.id, payload);
      else await createPlan(payload);

      alert(
        "Plan created successfully"
      );

      setForm({
        name: "",
        description: "",
        price: "",
        durationMonths: 1,
        studentLimit: "",
        teacherLimit: 10,
      });

      setShowForm(false);
      setEditing(null);

      loadPlans();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to create plan"
      );

    }
  }


  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>
            Subscription Plans
          </h1>

          <p>
            Manage SaaS pricing plans
          </p>
        </div>

        <button
          onClick={() =>
            setShowForm(
              !showForm
            )
          }
        >
          + Create Plan
        </button>

      </div>


      {showForm && (

        <div className="form-card">

          <h2>
            {editing ? "Edit Subscription Plan" : "Create Subscription Plan"}
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="form-grid">

              <input
                name="name"
                placeholder="Plan Name"
                value={form.name}
                onChange={
                  updateField
                }
                required
              />

              <input
                name="description"
                placeholder="Description"
                value={
                  form.description
                }
                onChange={
                  updateField
                }
              />

              <input
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={
                  updateField
                }
                required
              />

              <input
                name="durationMonths"
                type="number"
                min="1"
                placeholder="Duration in months"
                value={
                  form.durationMonths
                }
                onChange={
                  updateField
                }
              />

              <input
                name="studentLimit"
                type="number"
                min="1"
                placeholder="Student Limit"
                value={
                  form.studentLimit
                }
                onChange={
                  updateField
                }
                required
              />

              <input
                name="teacherLimit"
                type="number"
                min="1"
                placeholder="Teacher Limit"
                value={
                  form.teacherLimit
                }
                onChange={
                  updateField
                }
              />

            </div>

            <button type="submit">
              {editing ? "Save changes" : "Create Plan"}
            </button>

          </form>

        </div>

      )}


      <div className="plans-grid">

        {plans.map(
          (plan) => (

            <div
              className="plan-card"
              key={plan.id}
            >

              <h2>
                {plan.name}
              </h2>

              <div className="price">
                ₹{plan.price}
                <small>
                  / month
                </small>
              </div>

              <p>
                {plan.description}
              </p>

              <p>Status: {plan.is_active ? "Active" : "Inactive"}</p>
              <div className="action-row">
                <button type="button" onClick={() => { setEditing(plan); setForm({ name: plan.name || "", description: plan.description || "", price: plan.price ?? "", durationMonths: plan.duration_months ?? 1, studentLimit: plan.student_limit ?? "", teacherLimit: plan.teacher_limit ?? 10 }); setShowForm(true); }}>Edit</button>
                <button type="button" className="danger-button" onClick={async () => { if (!window.confirm(`Delete ${plan.name}?`)) return; try { await deletePlan(plan.id); await loadPlans(); } catch (e) { alert(e.response?.data?.message || "Could not delete plan"); } }}>Delete</button>
                <button type="button" className="secondary-button" onClick={async () => { try { await updatePlan(plan.id, { isActive: !plan.is_active }); await loadPlans(); } catch (e) { alert(e.response?.data?.message || "Could not update plan"); } }}>{plan.is_active ? "Deactivate" : "Activate"}</button>
              </div>

              <hr />

              <p>
                👨‍🎓 Students:
                <strong>
                  {" "}
                  {plan.student_limit}
                </strong>
              </p>

              <p>
                👨‍🏫 Teachers:
                <strong>
                  {" "}
                  {plan.teacher_limit}
                </strong>
              </p>

              <p>
                🏫 Institutes:
                <strong>
                  {" "}
                  {plan.institute_count}
                </strong>
              </p>

            </div>

          )
        )}

      </div>

    </div>
  );
}
