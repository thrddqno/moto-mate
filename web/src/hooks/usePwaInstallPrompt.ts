import { useCallback, useEffect, useMemo, useState } from 'react'

const INSTALL_PROMPT_DISMISS_KEY = 'moto-mate:pwa-install-dismissed-at'
const INSTALL_PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
}

function isIosStandalone() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean }
  return iosNavigator.standalone === true
}

function isIosSafari() {
  const userAgent = window.navigator.userAgent
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent)
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent)

  return isIosDevice && isSafari
}

function wasDismissedRecently() {
  const lastDismissedAt = window.localStorage.getItem(INSTALL_PROMPT_DISMISS_KEY)
  if (!lastDismissedAt) return false

  const dismissedAt = Number(lastDismissedAt)
  if (Number.isNaN(dismissedAt)) return false

  return Date.now() - dismissedAt < INSTALL_PROMPT_COOLDOWN_MS
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return isStandaloneMode() || isIosStandalone()
  })
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return wasDismissedRecently()
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')

    const syncInstalledState = () => {
      setIsInstalled(isStandaloneMode() || isIosStandalone())
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setDeferredPrompt(promptEvent)
    }

    const handleInstalled = () => {
      setDeferredPrompt(null)
      setIsDismissed(false)
      window.localStorage.removeItem(INSTALL_PROMPT_DISMISS_KEY)
      syncInstalledState()
    }

    mediaQuery.addEventListener('change', syncInstalledState)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      mediaQuery.removeEventListener('change', syncInstalledState)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const dismissInstallPrompt = useCallback(() => {
    window.localStorage.setItem(INSTALL_PROMPT_DISMISS_KEY, String(Date.now()))
    setIsDismissed(true)
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    setDeferredPrompt(null)

    if (choice.outcome === 'accepted') {
      window.localStorage.removeItem(INSTALL_PROMPT_DISMISS_KEY)
      setIsDismissed(false)
      return true
    }

    dismissInstallPrompt()
    return false
  }, [deferredPrompt, dismissInstallPrompt])

  const isIosInstallable = useMemo(
    () => isIosSafari() && !isInstalled && !isDismissed,
    [isDismissed, isInstalled],
  )

  const canPromptInstall = !!deferredPrompt && !isInstalled && !isDismissed
  const isInstallUnsupported = !isInstalled && !canPromptInstall && !isIosInstallable

  return {
    canPromptInstall,
    dismissInstallPrompt,
    isInstallUnsupported,
    isInstalled,
    isIosInstallable,
    promptInstall,
  }
}
