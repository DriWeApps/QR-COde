"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
    const [cafeName, setCafeName] = useState("");
    const [qrImage, setQrImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanURL, setScanURL] = useState("");

    const generateQR = async () => {
        if (!cafeName.trim()) {
            alert("Please enter the Cafe Name.");
            return;
        }

        try {
            setLoading(true);

            // Use Cafe Name as QR ID
            const qrId = cafeName.trim();

            const baseURL = window.location.origin;

            const trackingURL = `${baseURL}/api/scan/${encodeURIComponent(qrId)}`;

            setScanURL(trackingURL);

            // Generate QR Image
            const image = await QRCode.toDataURL(trackingURL, {
                width: 500,
                margin: 2,
            });

            setQrImage(image);

            // Save in DynamoDB
            const response = await fetch("/api/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: qrId,
                    cafeName: cafeName.trim(),
                    destination: trackingURL,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to create QR");
            }

            alert("✅ QR Code created successfully!");

        } catch (error: unknown) {
            console.error(error);
            const message =
                error instanceof Error ? error.message : "Something went wrong.";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">

            <h2 className="mb-2 text-3xl font-bold text-white">
                Generate Cafe QR Code
            </h2>

            <p className="mb-6 text-slate-400">
                Enter the cafe name and generate a unique QR code.
            </p>

            <input
                type="text"
                placeholder="Cafe Name (Example: CCD Baner)"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="mb-6 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
            />

            <button
                onClick={generateQR}
                disabled={loading}
                className="w-full rounded-lg bg-cyan-600 py-3 text-lg font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Generating QR..." : "Generate QR Code"}
            </button>

            {qrImage && (
                <div className="mt-10 text-center">

                    <div className="inline-block rounded-2xl bg-white p-5 shadow-lg">
                        <img
                            src={qrImage}
                            alt="Generated QR"
                            className="h-64 w-64"
                        />
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-4">

                        <a
                            href={qrImage}
                            download={`${cafeName}.png`}
                            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500"
                        >
                            Download QR
                        </a>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(scanURL);
                                alert("Tracking URL copied!");
                            }}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
                        >
                            Copy URL
                        </button>

                    </div>

                    <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-4">

                        <p className="mb-2 text-sm font-semibold text-cyan-400">
                            Tracking URL
                        </p>

                        <p className="break-all text-sm text-slate-300">
                            {scanURL}
                        </p>

                    </div>

                </div>
            )}
        </div>
    );
}