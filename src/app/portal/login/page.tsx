import Image from 'next/image'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth, signIn } from '@/auth'
import logo from '@/images/logo.png'
import microsoftIcon from '@/images/icons/microsoft.svg'

export const metadata: Metadata = { title: 'Staff Login' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session?.user) redirect('/portal/dashboard')

  const { error } = await searchParams
  const isUnauthorised = error === 'AccessDenied'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 sm:p-8">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image src={logo} alt="HSHB Logo" className="h-12 w-auto" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Staff Portal</h1>
            <p className="mt-1 text-sm text-gray-500">
              Hellenic School of High Barnet
            </p>
          </div>
        </div>

        {isUnauthorised && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Your Microsoft account is not authorised for this portal. Contact
            the admin team if you believe this is an error.
          </div>
        )}

        <form
          action={async () => {
            'use server'
            await signIn('microsoft-entra-id', {
              redirectTo: '/portal/dashboard',
            })
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Image src={microsoftIcon} alt="" height={20} width={20} />
            Sign in with Microsoft
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          This portal is for authorised HSHB staff only.
        </p>

        {process.env.E2E_TEST === 'true' && (
          <form
            className="mt-4"
            action={async (formData: FormData) => {
              'use server'
              await signIn('test-credentials', {
                email: formData.get('email'),
                password: formData.get('password'),
                redirectTo: '/portal/dashboard',
              })
            }}
            data-testid="test-login-form"
          >
            <input
              name="email"
              type="email"
              data-testid="test-email"
              className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="password"
              type="password"
              data-testid="test-password"
              className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              data-testid="test-login-button"
              className="w-full rounded bg-gray-800 px-4 py-2 text-sm text-white"
            >
              Test Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
