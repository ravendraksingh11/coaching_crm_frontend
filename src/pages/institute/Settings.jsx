import { useEffect, useState } from "react";
import {
  getInstituteSettings,
  updateInstituteName,
  updateInstitutePassword,
} from "../../api/institute.api";

export default function Settings() {
  const [instituteName, setInstituteName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getInstituteSettings()
      .then((result) => setInstituteName(result.data?.name || ""))
      .catch((err) => setError(err.response?.data?.message || "Could not load institute settings"));
  }, []);

  async function saveName(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setNameSaving(true);
    try {
      const result = await updateInstituteName(instituteName.trim());
      const updatedName = result.data?.name || instituteName.trim();
      setInstituteName(updatedName);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, instituteName: updatedName }));
      window.dispatchEvent(new Event("institute-name-updated"));
      setNotice("Institute name updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update institute name");
    } finally {
      setNameSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await updateInstitutePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("Password changed successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not change password");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div><h1>Settings</h1><p>Update your institute profile and administrator password.</p></div>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      {notice && <div className="settings-notice" role="status">{notice}</div>}

      <section className="dashboard-card settings-card">
        <h2>Institute name</h2>
        <p>This name is used to identify your institute in the application.</p>
        <form className="settings-form" onSubmit={saveName}>
          <label>Institute name<input required maxLength={255} value={instituteName} onChange={(event) => setInstituteName(event.target.value)} /></label>
          <button disabled={nameSaving || !instituteName.trim()}>{nameSaving ? "Saving…" : "Save institute name"}</button>
        </form>
      </section>

      <section className="dashboard-card settings-card">
        <h2>Change password</h2>
        <p>Enter your current password and choose a new password.</p>
        <form className="settings-form password-settings-form" onSubmit={changePassword} autoComplete="off">
          <label>Current password<input type="password" autoComplete="current-password" required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} /></label>
          <label>New password<input type="password" autoComplete="new-password" minLength={8} required value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} /></label>
          <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} required value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} /></label>
          <button disabled={passwordSaving}>{passwordSaving ? "Updating…" : "Change password"}</button>
        </form>
      </section>
    </div>
  );
}
