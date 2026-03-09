export default function StaffLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-16 rounded bg-gray-200" />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  'First name',
                  'Last name',
                  'Display name',
                  'Role',
                  'Contact',
                  'Class',
                  'Room',
                ].map((h) => (
                  <th key={h} className="px-6 py-3">
                    <div className="h-3 w-16 rounded bg-gray-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 rounded bg-gray-200" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
