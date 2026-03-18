export default function StaffAttendanceLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-9 w-28 rounded-lg bg-gray-200" />
      </div>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex gap-8">
            {['w-24', 'w-16', 'w-20', 'w-28'].map((w) => (
              <div key={w} className={`h-3 ${w} rounded bg-gray-200`} />
            ))}
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-gray-100 px-6 py-4 last:border-0"
          >
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded-full bg-gray-200" />
            <div className="ml-auto flex gap-2">
              <div className="h-8 w-20 rounded-md bg-gray-200" />
              <div className="h-8 w-20 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
