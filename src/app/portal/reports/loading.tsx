export default function ReportsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header + mode selector skeleton */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-36 rounded bg-gray-200" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-16 rounded-lg bg-gray-200" />
          ))}
          <div className="h-8 w-36 rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* Summary stats skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-3 h-9 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="h-4 w-36 rounded bg-gray-200" />
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {[1, 2, 3, 4].map((h) => (
                <th key={h} className="px-6 py-3">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-3">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </td>
                <td className="px-6 py-3">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </td>
                <td className="px-6 py-3">
                  <div className="h-4 w-12 rounded bg-gray-200" />
                </td>
                <td className="px-6 py-3">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
