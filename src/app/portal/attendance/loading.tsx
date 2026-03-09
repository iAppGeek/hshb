export default function AttendanceLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
      </div>

      {/* Filter area skeleton — shown only on initial page load */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <div>
          <div className="mb-1 h-3 w-10 rounded bg-gray-200" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-20 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 h-3 w-10 rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-8 w-36 rounded-lg bg-gray-200" />
            <div className="h-8 w-16 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Register grid skeleton */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex gap-4">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-14 rounded bg-gray-200" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-gray-100 px-6 py-4 last:border-0"
          >
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-7 w-20 rounded-full bg-gray-200" />
              <div className="h-7 w-14 rounded-full bg-gray-200" />
              <div className="h-7 w-20 rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
