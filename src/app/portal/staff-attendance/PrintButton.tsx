'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-200"
    >
      Print Sign-In Sheet
    </button>
  )
}
