'use client'

import { useEffect, useState } from 'react'
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline'

import {
  urlBase64ToUint8Array,
  saveSubscription,
  removeSubscription,
} from '@/lib/push-client'

type Status =
  | 'loading'
  | 'unsupported'
  | 'denied'
  | 'subscribed'
  | 'unsubscribed'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

export default function NotificationToggle() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    void (async () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true

      if (
        !isStandalone ||
        !('PushManager' in window) ||
        !('serviceWorker' in navigator)
      ) {
        setStatus('unsupported')
        return
      }

      if (Notification.permission === 'denied') {
        setStatus('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setStatus(sub ? 'subscribed' : 'unsubscribed')
    })()
  }, [])

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await saveSubscription(sub)
      setStatus('subscribed')
    } catch {
      // Permission denied or subscribe failed — stay unsubscribed
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await sub.unsubscribe()
      await removeSubscription(sub.endpoint)
      setStatus('unsubscribed')
    } catch {
      // Best-effort — if it fails the subscription will expire naturally
    }
  }

  if (status === 'loading' || status === 'unsupported') return null

  if (status === 'denied') {
    return <p className="text-xs text-gray-500">Notifications blocked</p>
  }

  return (
    <button
      onClick={status === 'subscribed' ? unsubscribe : subscribe}
      className="flex items-center gap-2 text-xs text-gray-400 transition hover:text-white"
      title={
        status === 'subscribed'
          ? 'Disable notifications'
          : 'Enable notifications'
      }
    >
      {status === 'subscribed' ? (
        <BellSlashIcon className="h-4 w-4" />
      ) : (
        <BellIcon className="h-4 w-4" />
      )}
      {status === 'subscribed' ? 'Notifications on' : 'Notifications off'}
    </button>
  )
}
