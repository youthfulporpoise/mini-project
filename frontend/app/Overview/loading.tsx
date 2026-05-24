export default function LoadingDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <style>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.8s ease-in-out infinite;
        }
      `}</style>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-[1400px]">

            {/* ── Header Skeleton ── */}
            <div className="mb-8 space-y-2">
              <div className="h-7 w-48 rounded-[8px] bg-gray-300 animate-pulse-fast"></div>
              <div className="h-4 w-96 rounded-[6px] bg-gray-200 animate-pulse-fast"></div>
            </div>

            {/* ── 4 Summary Cards Skeleton ── */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm animate-pulse-fast"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="mb-6 flex justify-between">
                    <div className="h-4 w-24 rounded-[6px] bg-gray-300"></div>
                    <div className="h-8 w-8 rounded-[8px] bg-gray-200"></div>
                  </div>
                  <div className="mb-2 h-8 w-32 rounded-[6px] bg-gray-300"></div>
                  <div className="h-3 w-40 rounded-[4px] bg-gray-200"></div>
                </div>
              ))}
            </div>

            {/* ── Main Layout Skeleton ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

              {/* Left Column (Charts/Tables) */}
              <div className="flex flex-col gap-6 lg:col-span-8">
                {/* Bar Chart Box */}
                <div className="flex h-[320px] w-full flex-col rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm animate-pulse-fast">
                  <div className="mb-6 h-5 w-40 rounded-[6px] bg-gray-300"></div>
                  <div className="flex-1 rounded-[8px] bg-gray-200"></div>
                </div>
                {/* Table Box */}
                <div className="flex h-[400px] w-full flex-col rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm animate-pulse-fast" style={{ animationDelay: '80ms' }}>
                  <div className="mb-6 h-5 w-48 rounded-[6px] bg-gray-300"></div>
                  <div className="flex-1 rounded-[8px] bg-gray-200"></div>
                </div>
              </div>

              {/* Right Column (Pie Chart/Recent Activity) */}
              <div className="flex flex-col gap-6 lg:col-span-4">
                {/* Pie Chart Box */}
                <div className="flex h-[320px] w-full flex-col rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm animate-pulse-fast" style={{ animationDelay: '120ms' }}>
                  <div className="mb-6 h-5 w-32 rounded-[6px] bg-gray-300"></div>
                  <div className="mx-auto w-[200px] max-w-full aspect-square rounded-full bg-gray-200"></div>
                </div>
                {/* Transactions Box */}
                <div className="flex h-[400px] w-full flex-col rounded-[14px] border border-gray-200 bg-white p-6 shadow-sm animate-pulse-fast" style={{ animationDelay: '160ms' }}>
                  <div className="mb-6 h-5 w-40 rounded-[6px] bg-gray-300"></div>
                  <div className="flex-1 rounded-[8px] bg-gray-200"></div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
