import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  fallback: string
  label?: string
}

export function BackButton({ fallback, label = 'Go back' }: BackButtonProps) {
  const navigate = useNavigate()

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(fallback, { replace: true })
  }

  return (
    <button className="icon-button" onClick={goBack} type="button" aria-label={label}>
      ‹
    </button>
  )
}
