import { sendGAEvent } from '@next/third-parties/google'

export const sendEvent = (
  actionType: string,
  actionName: string,
  data?: unknown,
): void => {
  console.debug('[EVENT]', actionType, { actionName, data })
  if (process.env.NODE_ENV !== 'production') return
  const params: Record<string, unknown> = { action_name: actionName }
  if (typeof data === 'string') params.label = data
  else if (typeof data === 'object' && data !== null)
    Object.assign(params, data)
  sendGAEvent('event', actionType, params)
}
