import { useEffect, useState, type FormEvent } from 'react'
import { useBikeStore } from '../../stores/bikeStore'

interface MileageModalProps {
  bikeId: string | null
  open: boolean
  onClose: () => void
}

export function MileageModal({ bikeId, open, onClose }: MileageModalProps) {
  const { bikes, fetchBikes, updateMileage } = useBikeStore()
  const bike = bikes.find((item) => item.id === bikeId)
  const [mileage, setMileage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && bikes.length === 0) void fetchBikes()
  }, [bikes.length, fetchBikes, open])

  function closeAndReset() {
    setMileage('')
    setError(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!bikeId) return
    const nextMileage = Number(mileage || bike?.currentMileage || 0)
    if (!Number.isFinite(nextMileage) || nextMileage < 0) {
      setError('Enter a valid mileage.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await updateMileage(bikeId, nextMileage)
      closeAndReset()
    } catch {
      setError('Failed to update mileage.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="sheet-backdrop" role="presentation" onClick={closeAndReset}>
      <section className="action-sheet card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={closeAndReset} type="button" aria-label="Close">×</button>
        <p className="eyebrow">{bike?.name || 'Selected bike'}</p>
        <h2 className="sheet-title">Update Mileage</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Current Mileage</span>
            <input
              inputMode="numeric"
              value={mileage}
              onChange={(event) => setMileage(event.target.value)}
              placeholder={bike?.currentMileage?.toString() || '0'}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Mileage'}</button>
        </form>
      </section>
    </div>
  )
}
