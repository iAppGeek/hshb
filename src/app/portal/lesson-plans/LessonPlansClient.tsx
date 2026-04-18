'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { XMarkIcon } from '@heroicons/react/24/outline'

import type { LessonPlanRow } from '@/db'
import { formatCalendarDate, formatDateTimeInSchoolTz } from '@/lib/datetime'
import { isTeacher } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'
import Tooltip from '@/components/Tooltip'

type Props = {
  lessonPlans: LessonPlanRow[]
  role: StaffRole
  canCreate: boolean
  canEdit: boolean
}

function formatDate(dateStr: string) {
  return formatCalendarDate(dateStr)
}

export default function LessonPlansClient({
  lessonPlans,
  role,
  canCreate,
  canEdit,
}: Props) {
  const [selected, setSelected] = useState<LessonPlanRow | null>(null)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lesson Plans</h1>
        {canCreate && (
          <Link
            href="/portal/lesson-plans/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            Add lesson plan
          </Link>
        )}
      </div>

      {isTeacher(role) && (
        <p className="mb-4 text-sm text-gray-500">
          You can only view and create lesson plans for your class.
        </p>
      )}

      {lessonPlans.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No lesson plans found.</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 sm:hidden">
            {lessonPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {plan.class.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(plan.lesson_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {canEdit ? (
                      <Link
                        href={`/portal/lesson-plans/${plan.id}/edit`}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Edit
                      </Link>
                    ) : (
                      !isTeacher(role) && (
                        <Tooltip text="You don't have permission to edit lesson plans">
                          <span className="cursor-not-allowed text-xs font-medium text-gray-400">
                            Edit
                          </span>
                        </Tooltip>
                      )
                    )}
                    <button
                      onClick={() => setSelected(plan)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Details
                    </button>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-gray-500">
                  {plan.description}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  By {plan.creator.first_name} {plan.creator.last_name}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Lesson date', 'Class', 'Description', 'Created by'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ),
                    )}
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {lessonPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {formatDate(plan.lesson_date)}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {plan.class.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className="line-clamp-1 max-w-xs">
                          {plan.description}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        {plan.creator.first_name} {plan.creator.last_name}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          {canEdit ? (
                            <Link
                              href={`/portal/lesson-plans/${plan.id}/edit`}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Edit
                            </Link>
                          ) : (
                            !isTeacher(role) && (
                              <Tooltip text="You don't have permission to edit lesson plans">
                                <span className="cursor-not-allowed text-gray-400">
                                  Edit
                                </span>
                              </Tooltip>
                            )
                          )}
                          <button
                            onClick={() => setSelected(plan)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selected && (
        <LessonPlanModal
          plan={selected}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function LessonPlanModal({
  plan,
  canEdit,
  onClose,
}: {
  plan: LessonPlanRow
  canEdit: boolean
  onClose: () => void
}) {
  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {plan.class.name} — {formatDate(plan.lesson_date)}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <section>
            <h3 className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Lesson Description
            </h3>
            <p className="text-sm whitespace-pre-wrap text-gray-900">
              {plan.description}
            </p>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-700">Created by: </span>
                {plan.creator.first_name} {plan.creator.last_name}
              </p>
              <p className="text-xs text-gray-400">
                {formatDateTimeInSchoolTz(plan.created_at)}
              </p>
              {plan.updater && (
                <>
                  <p className="mt-2">
                    <span className="font-medium text-gray-700">
                      Last updated by:{' '}
                    </span>
                    {plan.updater.first_name} {plan.updater.last_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTimeInSchoolTz(plan.updated_at)}
                  </p>
                </>
              )}
            </div>
          </section>
        </div>

        {canEdit && (
          <div className="shrink-0 border-t border-gray-200 px-6 py-3">
            <Link
              href={`/portal/lesson-plans/${plan.id}/edit`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
