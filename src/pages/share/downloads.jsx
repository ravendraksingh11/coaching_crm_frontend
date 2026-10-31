
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import "./downloadApp.css";

const APK_URL =
    "https://institexa.in/downloads/institexa.apk";

export default function DownloadApp() {
    return (
        <section className="download-app">
            <div className="download-container">

                <div className="download-content">
                    <span className="download-label">
                        INSTITEXA ANDROID APP
                    </span>

                    <h2>
                        Your Institute,
                        <br />
                        Always in Your Pocket!
                    </h2>

                    <p>
                        Experience smarter institute management
                        with Institexa. Stay connected and access
                        your learning platform anytime, anywhere.
                    </p>

                    <a
                        href={APK_URL}
                        className="download-button"
                        download
                    >
                        Download Android App
                    </a>

                    <small>
                        Official APK • Android Devices
                    </small>
                </div>

                <div className="qr-card">
                    <h3>Scan to Download</h3>

                    <p>
                        Scan this QR code using your
                        mobile camera.
                    </p>

                    <div className="qr-wrapper">
                        <QRCodeSVG
                            value={APK_URL}
                            size={210}
                            level="H"
                            includeMargin
                        />
                    </div>

                    <span>
                        institexa.in
                    </span>
                </div>

            </div>
        </section>
    );
}
