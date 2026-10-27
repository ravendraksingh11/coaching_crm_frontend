import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  loadScanResult,
  removeScanResult,
} from "../../utils/scanResultsStorage";

export default function ScanResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const scanId = new URLSearchParams(location.search).get("scanId");
  const [scanResult, setScanResult] = useState(null);
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const objectUrls = [];

    async function loadResult() {
      if (!scanId) {
        setError("Scan results are unavailable. Please scan the file again.");
        setLoading(false);
        return;
      }

      try {
        const result = await loadScanResult(scanId);
        if (!result) {
          setError("Scan results are unavailable. Please scan the file again.");
          return;
        }
        if (!active) return;

        const figurePreviews = (result.figures || []).map((figure) => {
          const url = URL.createObjectURL(figure.blob);
          objectUrls.push(url);
          return { label: figure.label, url };
        });

        if (active) {
          setScanResult(result);
          setFigures(figurePreviews);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Could not load scan results.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadResult();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [scanId]);

  async function returnToTest() {
    try {
      if (scanId) await removeScanResult(scanId);
      const returnTo =
        scanResult?.returnTo === "/institute/tests/create"
          ? scanResult.returnTo
          : "/institute/tests/create";
      navigate(returnTo, {
        state: { scanDraft: scanResult?.draft },
      });
    } catch (removeError) {
      setError(removeError.message || "Could not clear the scan result.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Scanned document</h1>
          <p>Review and select the recognized text and figure previews.</p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => void returnToTest()}
        >
          Back to test
        </button>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      {loading ? (
        <div className="page-loading">Loading scan results…</div>
      ) : (
        <>
          {scanResult?.scannedText ? (
            <section className="dashboard-card scan-results-card">
              <h2>Recognized text</h2>
              <pre className="scan-results-text">{scanResult.scannedText}</pre>
            </section>
          ) : !error ? (
            <div className="dashboard-card">
              <p>No readable text was found, but visual previews are available.</p>
            </div>
          ) : null}
          {figures.length > 0 && (
            <section className="dashboard-card scan-figures-card">
              <h2>Figures and page previews</h2>
              {figures.map((figure) => (
                <figure className="scan-figure" key={figure.url}>
                  <figcaption>{figure.label}</figcaption>
                  <img src={figure.url} alt={figure.label} />
                </figure>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
