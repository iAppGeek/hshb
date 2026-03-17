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
    async function checkStatus() {
      if (!('PushManager' in window) || !('serviceWorker' in navigator)) {
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
    }

    void checkStatus()
    window.addEventListener('focus', checkStatus)
    window.addEventListener('push-subscription-changed', checkStatus)
    return () => {
      window.removeEventListener('focus', checkStatus)
      window.removeEventListener('push-subscription-changed', checkStatus)
    }
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

  const subscribed = status === 'subscribed'

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      className={`flex w-full items-center justify-between gap-2 text-xs font-medium transition ${
        subscribed
          ? 'text-green-400 hover:text-green-300'
          : 'text-red-400 hover:text-red-300'
      }`}
    >
      <span className="flex items-center gap-2">
        {subscribed ? (
          <BellIcon className="h-4 w-4" />
        ) : (
          <BellSlashIcon className="h-4 w-4" />
        )}
        Notifications
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          subscribed
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}
      >
        {subscribed ? 'On' : 'Off'}
      </span>
    </button>
  )
}
