import SectionCard from '../../_components/SectionCard'

type Stat = {
  label: string
  value: string | number
  sub: string | null
}

type ClassRow = {
  name: string
  enrolled: number
  presentCount: number | null
  attendanceCreatedAt: string | null
  attendanceUpdatedAt: string | null
}

type Props = {
  stats: Stat[]
  enrolmentByClass: ClassRow[]
}

const TH =
  'px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase'

export default function DayReport({ stats, enrolmentByClass }: Props) {
  return (
    <>
      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-6"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">{value}</span>
              {sub && (
                <span className="text-sm font-medium text-gray-500">{sub}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Attendance by class */}
      <SectionCard title="Attendance by Class">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={TH}>Class</th>
                <th className={TH}>Attendance</th>
                <th className={TH}>Record Times</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrolmentByClass.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {row.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {row.presentCount !== null
                      ? `${row.presentCount}/${row.enrolled}`
                      : `—/${row.enrolled}`}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {row.attendanceCreatedAt ? (
                      <div className="flex flex-col gap-0.5">
                        <span>Created: {row.attendanceCreatedAt}</span>
                        <span>Updated: {row.attendanceUpdatedAt}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-amber-600">
                        Not Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  )
}
