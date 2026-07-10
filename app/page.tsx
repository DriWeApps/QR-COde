"use client";

import { useEffect, useState } from "react";
import QRGenerator from "@/components/QRGenerator";
import StatsCard from "@/components/StatsCard";

interface QRData {
  id: string;
  cafeName: string;
  destination: string;
  scanCount: number;
  createdAt: string;
}

export default function Home() {
  const [qrData, setQrData] = useState<QRData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();

      if (data.success) {
        setQrData(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalQR = qrData.length;

  const totalScans = qrData.reduce(
    (total, item) => total + (item.scanCount ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              DriWE - QR Analytics Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Generate, Track & Monitor all QR Codes in one place.
            </p>
          </div>

          <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
            <span className="text-3xl">📱</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-700 p-8 hover:border-cyan-400 transition-all duration-300 shadow-xl">

            <p className="text-slate-400 uppercase text-sm">
              Total QR Codes
            </p>

            <h2 className="text-5xl font-bold mt-3 text-cyan-400">
              {totalQR}
            </h2>

          </div>

          <div className="rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-700 p-8 hover:border-green-400 transition-all duration-300 shadow-xl">

            <p className="text-slate-400 uppercase text-sm">
              Total Scans
            </p>

            <h2 className="text-5xl font-bold mt-3 text-green-400">
              {totalScans}
            </h2>

          </div>

        </div>

        {/* Generator */}
        <div className="mb-10 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-700 p-8 shadow-xl">

          <h2 className="text-2xl font-bold mb-6">
            Generate QR Code
          </h2>

          <QRGenerator />

        </div>

        {/* Analytics Table */}
        <div className="rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-700 shadow-xl overflow-hidden">

          <div className="px-8 py-6 border-b border-slate-700">

            <h2 className="text-2xl font-bold">
              QR Analytics
            </h2>

          </div>

          {loading ? (

            <div className="py-20 text-center text-slate-400">
              Loading...
            </div>

          ) : qrData.length === 0 ? (

            <div className="py-20 text-center text-slate-500">
              No QR Codes Found
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-800">

                  <tr>

                    <th className="text-left px-6 py-4 text-slate-300">
                      Cafe Name
                    </th>

                    <th className="text-left px-6 py-4 text-slate-300">
                      Destination
                    </th>

                    <th className="text-left px-6 py-4 text-slate-300">
                      Scans
                    </th>

                    <th className="text-left px-6 py-4 text-slate-300">
                      Created
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {qrData.map((qr, index) => (

                    <tr
                      key={qr.id || qr.cafeName || index}
                      className="border-b border-slate-800 hover:bg-slate-800/70 transition"
                    >

                      <td className="px-6 py-5 font-semibold text-cyan-400">
                        {qr.cafeName}
                      </td>

                      <td className="px-6 py-5">

                        {qr.destination ? (

                          <a
                            href={qr.destination}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline"
                          >
                            Open QR Link
                          </a>

                        ) : (

                          <span className="text-slate-500">
                            -
                          </span>

                        )}

                      </td>

                      <td className="px-6 py-5">

                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                          {qr.scanCount ?? 0}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-slate-400">

                        {qr.createdAt
                          ? new Date(qr.createdAt).toLocaleDateString()
                          : "-"}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </main>
  );
}