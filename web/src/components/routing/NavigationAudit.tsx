import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function NavigationAudit() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousPathRef = useRef<string | null>(null)

  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}`
    console.debug('[navigation]', {
      from: previousPathRef.current,
      to: currentPath,
      type: navigationType,
    })
    previousPathRef.current = currentPath
  }, [location.pathname, location.search, navigationType])

  return null
}
