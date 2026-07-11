import Link from "next/link";

export default async function ScanSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageFromQuery =
    typeof resolvedSearchParams.message === "string"
      ? resolvedSearchParams.message
      : `Thank you for scanning QR ${id}.`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-10 text-center shadow-2xl">
        <div className="text-6xl mb-6">✅</div>

        <h1 className="text-4xl font-bold text-white mb-4">Scan Successful</h1>

        <p className="text-slate-300 text-lg mb-3">{messageFromQuery}</p>

        <p className="text-slate-400 mb-6">
          Your response has been recorded successfully.
        </p>

        <Link
          href="https://driwes-9751lq46w-driweapps-projects.vercel.app"
          target="_blank"
          className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-8 py-3 rounded-xl transition"
        >
          Visit DriWE Website
        </Link>

        <p className="mt-8 text-slate-500">Thank you for your time and support.</p>
        <p className="mt-2 text-cyan-400 font-semibold">— Team DriWE 🚖</p>
      </div>
    </main>
  );
}