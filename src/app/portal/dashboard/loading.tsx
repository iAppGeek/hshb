export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <div className="h-12 w-12 rounded-lg bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="mt-2 h-8 w-12 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
