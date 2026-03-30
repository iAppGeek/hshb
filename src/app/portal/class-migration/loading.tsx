export default function ClassMigrationLoading(): React.ReactElement {
  return (
    <div className="max-w-2xl animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
      </div>

      {/* Source class section skeleton */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="mb-4 h-4 w-28 rounded bg-gray-200" />
        <div className="h-9 w-full rounded-lg bg-gray-200" />
      </div>

      {/* New class details skeleton */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="mb-4 h-4 w-36 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-3 w-24 rounded bg-gray-200" />
              <div className="h-9 w-full rounded-lg bg-gray-200" />
            </div>
          ))}
          <div className="sm:col-span-2">
            <div className="mb-1 h-3 w-16 rounded bg-gray-200" />
            <div className="h-9 w-full rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-9 w-32 rounded-lg bg-gray-200" />
        <div className="h-4 w-14 rounded bg-gray-200" />
      </div>
    </div>
  )
}
