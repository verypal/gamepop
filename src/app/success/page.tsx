import Link from "next/link";

export default function Success() {
  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">You’re in! ✅</h1>
      <p className="mt-2 text-gray-600">
        Your spot is confirmed. We’ve saved your place.
      </p>

      <div className="mt-6 space-y-2">
        <button className="w-full rounded-xl border py-3">
          Add to Calendar
        </button>
        <Link
          href="/s/ABC123"
          className="block text-center rounded-xl bg-black text-white py-3"
        >
          Back to Session
        </Link>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        (This is a mock success page. Payments hook in soon.)
      </p>
    </main>
  );
}
