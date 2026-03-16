import 'server-only'

import webpush from 'web-push'

import type { PushSubscriptionRow } from '@/db'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export type AttendancePushPayload = {
  title: string
  body: string
  data: { url: string }
}

export async function sendPushNotification(
  subscription: PushSubscriptionRow,
  payload: AttendancePushPayload,
): Promise<void> {
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify(payload),
  )
}
