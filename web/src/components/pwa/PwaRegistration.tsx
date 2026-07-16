import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaRegistration() {
  useRegisterSW({
    immediate: true,
  })

  return null
}
