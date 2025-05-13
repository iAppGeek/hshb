import { sendGAEvent } from '@next/third-parties/google'

export const sendEvent = (
  actionType: string,
  actionName: string,
  data: unknown,
) => {
  console.debug('[EVENT]', actionType, { actionName, data })
  sendGAEvent('event', actionType, { actionName, data })
}
