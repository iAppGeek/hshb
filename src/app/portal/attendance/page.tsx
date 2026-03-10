import { Suspense } from 'react'
import { type Metadata } from 'next'

import { auth } from '@/auth'
import { getAllClasses, getClassesByTeacher } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import AttendanceFilters from './AttendanceFilters'
import AttendanceRegister from './AttendanceRegister'

export const metadata: Metadata = { title: 'Attendance' }

function RegisterSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-4 w-48 rounded bg-gray-200" />
      <div className="mb-4 flex gap-4">
        <div className="h-7 w-24 rounded-full bg-gray-200" />
        <div className="h-7 w-20 rounded-full bg-gray-200" />
        <div className="h-7 w-20 rounded-full bg-gray-200" />
      </div>
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
      <div className="mt-4 h-9 w-32 rounded-lg bg-gray-200" />
    </div>
  )
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>
}) {
  const session = await auth()
  const role = session?.user?.role as StaffRole
  const staffId = session?.user?.staffId ?? ''

  const { classId: qClassId, date: qDate } = await searchParams

  const today = new Date().toISOString().split('T')[0]
  const selectedDate = qDate ?? today

  const classes =
    role === 'teacher'
      ? await getClassesByTeacher(staffId)
      : await getAllClasses()

  const selectedClassId = qClassId ?? classes[0]?.id ?? null
  const selectedClass = classes.find((c) => c.id === selectedClassId)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance Register
        </h1>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No classes assigned.</p>
        </div>
      ) : (
        <>
          <AttendanceFilters
            classes={classes}
            selectedClassId={selectedClassId}
            selectedDate={selectedDate}
          />

          {selectedClassId && (
            <Suspense
              key={`${selectedClassId}-${selectedDate}`}
              fallback={<RegisterSkeleton />}
            >
              <AttendanceRegister
                classId={selectedClassId}
                date={selectedDate}
                className={selectedClass?.name ?? selectedClassId}
                role={role}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  )
}
