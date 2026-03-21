export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
