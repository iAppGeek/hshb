'use server'

import { revalidateTag } from 'next/cache'

export async function revalidateAllCaches() {
  revalidateTag('students', 'max')
  revalidateTag('classes', 'max')
  revalidateTag('staff', 'max')
}
