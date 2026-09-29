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

import Students from "./pages/institute/Students";
import CreateStudent from "./pages/institute/CreateStudent";
import Courses from "./pages/institute/Courses";
import CreateCourse from "./pages/institute/CreateCourse";
import Batches from "./pages/institute/Batches";
import CreateBatch from "./pages/institute/CreateBatch";
import Subscription from "./pages/institute/Subscription";
import Settings from "./pages/institute/Settings";
import Subscriptions from "./pages/super-admin/Subscriptions";
import StudentLayout from "./layouts/StudentLayout";
import ParentLayout from "./layouts/ParentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentTests from "./pages/student/Tests";
import StudentTest from "./pages/student/Test";
import StudentAttendance from "./pages/student/Attendance";
import ParentAttendance from "./pages/parent/Attendance";
import InstituteTests from "./pages/institute/Tests";
import ViewTest from "./pages/institute/ViewTest";
import AssignedTestStudents from "./pages/institute/AssignedTestStudents";
import InstituteAttendance from "./pages/institute/Attendance";
import InstituteFees from "./pages/institute/Fees";
import CreateAttendanceSession from "./pages/institute/CreateAttendanceSession";
import TakeAttendance from "./pages/institute/TakeAttendance";

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

          {/* <Route
            path="subscription"
            element={
              <Subscription />
            }
          /> */}

          <Route path="subscriptions" element={<Subscriptions />} />

        </Route>

        <Route path="/teacher" element={<ProtectedRole role="TEACHER"><TeacherLayout /></ProtectedRole>}>
          <Route index element={<Navigate to="attendance" replace />} />
          <Route path="attendance" element={<InstituteAttendance />} />
          <Route path="fees" element={<InstituteFees />} />
          <Route path="attendance/create" element={<CreateAttendanceSession />} />
          <Route path="attendance/session/:id" element={<TakeAttendance />} />
        </Route>

        <Route path="/parent" element={<ProtectedRole role="PARENT"><ParentLayout /></ProtectedRole>}>
          <Route index element={<Navigate to="attendance" replace />} />
          <Route path="attendance" element={<ParentAttendance />} />
        </Route>

        <Route path="/student" element={<ProtectedRole role="STUDENT"><StudentLayout /></ProtectedRole>}>
          <Route index element={<Navigate to="tests" replace />} />
          <Route path="tests" element={<StudentTests />} />
          <Route path="tests/:id" element={<StudentTest />} />
          <Route path="attendance" element={<StudentAttendance />} />
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

          <Route
            path="students"
            element={<Students />}
          />
          <Route path="students/create" element={<CreateStudent />} />
          <Route path="students/:studentId/edit" element={<CreateStudent />} />

          <Route
            path="courses"
            element={<Courses />}
          />
          <Route path="courses/create" element={<CreateCourse />} />

          <Route
            path="batches"
            element={<Batches />}
          />
          <Route path="batches/create" element={<CreateBatch />} />

          <Route path="tests" element={<InstituteTests />} />
          <Route path="tests/create" element={<InstituteTests createMode />} />
          <Route path="tests/:testId/view" element={<ViewTest />} />
          <Route path="tests/:testId/students" element={<AssignedTestStudents />} />
          <Route path="attendance" element={<InstituteAttendance />} />
          <Route path="fees" element={<InstituteFees />} />
          <Route path="attendance/create" element={<CreateAttendanceSession />} />
          <Route path="attendance/session/:id" element={<TakeAttendance />} />
          <Route path="settings" element={<Settings />} />

          <Route
            path="subscription"
            element={
              // <ProtectedRole allowedRoles={["INSTITUTE_ADMIN"]}>
              <Subscription />
              // </ProtectedRole>
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
