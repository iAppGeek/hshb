'use client'

import { useEffect, useState } from 'react'
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

import { urlBase64ToUint8Array, saveSubscription } from '@/lib/push-client'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const DISMISSED_KEY = 'push-notif-dismissed'

export default function NotificationBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (
      !('PushManager' in window) ||
      !('serviceWorker' in navigator) ||
      Notification.permission === 'denied' ||
      localStorage.getItem(DISMISSED_KEY)
    ) {
      return
    }

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (!sub) setVisible(true)
      })
    })
  }, [])

  async function handleEnable() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await saveSubscription(sub)
      window.dispatchEvent(new Event('push-subscription-changed'))
      setVisible(false)
    } catch {
      // Permission denied or failed — banner stays visible
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <div className="flex items-center gap-2">
        <BellIcon className="h-4 w-4 shrink-0" />
        <span>Enable notifications to be alerted when attendance is saved</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleEnable}
          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
