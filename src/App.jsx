import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";

import SuperAdminLayout
  from "./layouts/SuperAdminLayout";

import InstituteLayout
  from "./layouts/InstituteLayout";

import SuperAdminDashboard
  from "./pages/super-admin/Dashboard";

import Institutes
  from "./pages/super-admin/Institutes";

import Plans
  from "./pages/super-admin/Plans";

import InstituteDashboard
  from "./pages/institute/Dashboard";


function ProtectedRole({
  role,
  children,
}) {
  const token =
    localStorage.getItem("token");

  const user =
    JSON.parse(
      localStorage.getItem("user") ||
      "null"
    );

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user?.role !== role) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


export default function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ============================
            SUPER ADMIN
        ============================ */}

        <Route
          path="/super-admin"
          element={
            <ProtectedRole
              role="SUPER_ADMIN"
            >
              <SuperAdminLayout />
            </ProtectedRole>
          }
        >

          <Route
            index
            element={
              <Navigate
                to="dashboard"
              />
            }
          />

          <Route
            path="dashboard"
            element={
              <SuperAdminDashboard />
            }
          />

          <Route
            path="institutes"
            element={
              <Institutes />
            }
          />

          <Route
            path="plans"
            element={
              <Plans />
            }
          />

        </Route>


        {/* ============================
            INSTITUTE ADMIN
        ============================ */}

        <Route
          path="/institute"
          element={
            <ProtectedRole
              role="INSTITUTE_ADMIN"
            >
              <InstituteLayout />
            </ProtectedRole>
          }
        >

          <Route
            index
            element={
              <Navigate
                to="dashboard"
              />
            }
          />

          <Route
            path="dashboard"
            element={
              <InstituteDashboard />
            }
          />

        </Route>


        <Route
          path="*"
          element={
            <Navigate
              to="/login"
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}