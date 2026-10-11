import { useEffect, useState } from "react";
import { Mail, Phone, RefreshCw } from "lucide-react";
import { getProductEnquiries, updateProductEnquiryStatus } from "../../api/enquiries.api";

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    let active = true;

    getProductEnquiries()
      .then((result) => {
        if (active) setEnquiries(result.data || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to load product enquiries.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function loadEnquiries() {
    setLoading(true);
    setError("");
    try {
      const result = await getProductEnquiries();
      setEnquiries(result.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load product enquiries.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleContacted(enquiry) {
    setUpdatingId(enquiry.id);
    setError("");
    try {
      const result = await updateProductEnquiryStatus(enquiry.id, !enquiry.contacted);
      setEnquiries((current) => current.map((item) => item.id === enquiry.id ? result.data : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update enquiry status.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Product enquiries</h1>
          <p>Review and follow up on Shikvanta product enquiries.</p>
        </div>
        <button
          className="refresh-button"
          onClick={() => {
            setLoading(true);
            setError("");
            loadEnquiries();
          }}
          disabled={loading}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      {loading ? (
        <div className="page-loading">Loading enquiries…</div>
      ) : enquiries.length === 0 ? (
        <div className="dashboard-card empty-state">No product enquiries yet.</div>
      ) : (
        <div className="table-card enquiries-table-card">
          <table className="enquiries-table">
            <thead>
              <tr><th>Enquiry</th><th>Contact details</th><th>Received</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td className="enquiries-message">
                    <strong>{enquiry.full_name}</strong>
                    <p>{enquiry.enquiry}</p>
                  </td>
                  <td>
                    <a className="enquiry-admin-contact" href={`mailto:${enquiry.email}`}><Mail size={15} />{enquiry.email}</a>
                    <a className="enquiry-admin-contact" href={`tel:${enquiry.mobile}`}><Phone size={15} />{enquiry.mobile}</a>
                  </td>
                  <td>{formatDate(enquiry.created_at)}</td>
                  <td><span className={`enquiry-status ${enquiry.contacted ? "is-contacted" : "is-pending"}`}>{enquiry.contacted ? "Contacted" : "Not contacted"}</span></td>
                  <td>
                    <button className={enquiry.contacted ? "secondary-button" : ""} onClick={() => toggleContacted(enquiry)} disabled={updatingId === enquiry.id}>
                      {updatingId === enquiry.id ? "Saving…" : enquiry.contacted ? "Mark not contacted" : "Mark contacted"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
