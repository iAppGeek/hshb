import { sendGAEvent } from '@next/third-parties/google'

export const sendEvent = (
  actionType: string,
  actionName: string,
  data?: unknown,
) => {
  console.debug('[EVENT]', actionType, { actionName, data })
  if (process.env.NODE_ENV !== 'production') return
  sendGAEvent('event', actionType, { action_name: actionName })
}
