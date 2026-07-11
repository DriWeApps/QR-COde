"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function CreateQRPage() {
    const [id, setId] = useState("");
    const [destination, setDestination] = useState("");
    const [qrImage, setQrImage] = useState("");
    const [loading, setLoading] = useState(false);

    const generateQR = async () => {
        if (!id || !destination) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);

        try {
            // URL that will be encoded in the QR
            const scanUrl = `${window.location.origin}/scan/${id}`;

            // Generate QR image
            const image = await QRCode.toDataURL(scanUrl);

            setQrImage(image);

            // Save QR information
            const res = await fetch("/api/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    cafeName: id,
                    destination,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert("QR Created Successfully!");
            } else {
                alert("Something went wrong.");
            }
        } catch (err) {
            console.error(err);
            alert("Error generating QR");
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!qrImage) return;

        const link = document.createElement("a");
        link.href = qrImage;
        link.download = `${id}.png`;
        link.click();
    };

    return (
        <main className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">
                Create QR Code
            </h1>

            <div className="space-y-4">

                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="QR ID (driver001)"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />

                <input
                    className="w-full border rounded-lg p-3"
                    placeholder="Destination URL"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />

                <button
                    onClick={generateQR}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full"
                >
                    {loading ? "Generating..." : "Generate QR"}
                </button>

            </div>

            {qrImage && (
                <div className="mt-10 text-center">

                    <img
                        src={qrImage}
                        alt="QR Code"
                        className="mx-auto w-72 h-72"
                    />

                    <button
                        onClick={downloadQR}
                        className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg"
                    >
                        Download QR
                    </button>

                </div>
            )}
        </main>
    );
}