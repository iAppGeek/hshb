export default function TimetablesLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded bg-gray-200" />
        <div className="h-9 w-24 rounded-lg bg-gray-200" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((day) => (
          <div
            key={day}
            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
          >
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {['Time', 'Class', 'Subject', 'Room'].map((h) => (
                    <th key={h} className="px-6 py-3">
                      <div className="h-3 w-14 rounded bg-gray-200" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3">
                      <div className="h-4 w-28 rounded bg-gray-200" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="h-4 w-20 rounded bg-gray-200" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="h-4 w-12 rounded bg-gray-200" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
