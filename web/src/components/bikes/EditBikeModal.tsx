import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBikeStore } from '../../stores/bikeStore'
import type { Motorcycle } from '../../types'

interface EditBikeModalProps {
  bike: Motorcycle
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function EditBikeModal({ bike, open, onClose, onSaved }: EditBikeModalProps) {
  const navigate = useNavigate()
  const { deleteBike, updateBike } = useBikeStore()
  const [name, setName] = useState(bike.name)
  const [make, setMake] = useState(bike.make)
  const [model, setModel] = useState(bike.model)
  const [year, setYear] = useState(bike.year?.toString() || '')
  const [currentMileage, setCurrentMileage] = useState(bike.currentMileage.toString())
  const [licensePlate, setLicensePlate] = useState(bike.licensePlate || '')
  const [vin, setVin] = useState(bike.vin || '')
  const [notes, setNotes] = useState(bike.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!open) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const mileage = Number(currentMileage)
    if (!name.trim() || !make.trim() || !model.trim() || !Number.isFinite(mileage)) {
      setError('Name, make, model, and mileage are required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const saved = await updateBike(bike.id, {
        name: name.trim(),
        make: make.trim(),
        model: model.trim(),
        year: year ? Number(year) : undefined,
        currentMileage: mileage,
        licensePlate: licensePlate.trim() || undefined,
        vin: vin.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      if (saved) {
        onSaved()
        onClose()
      } else {
        setError('Failed to save bike.')
      }
    } catch {
      setError('Failed to save bike.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove ${bike.name}? This will hide the bike from your garage.`)) return
    await deleteBike(bike.id)
    navigate('/bikes', { replace: true })
  }

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="action-sheet card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} type="button" aria-label="Close">×</button>
        <p className="eyebrow">Garage</p>
        <h2 className="sheet-title">Edit Bike</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label><span>Bike Name</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <div className="form-grid">
            <label><span>Make</span><input value={make} onChange={(event) => setMake(event.target.value)} /></label>
            <label><span>Model</span><input value={model} onChange={(event) => setModel(event.target.value)} /></label>
          </div>
          <div className="form-grid">
            <label><span>Year</span><input inputMode="numeric" value={year} onChange={(event) => setYear(event.target.value)} /></label>
            <label><span>Mileage</span><input inputMode="numeric" value={currentMileage} onChange={(event) => setCurrentMileage(event.target.value)} /></label>
          </div>
          <label><span>Plate</span><input value={licensePlate} onChange={(event) => setLicensePlate(event.target.value)} /></label>
          <label><span>VIN</span><input value={vin} onChange={(event) => setVin(event.target.value)} /></label>
          <label><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Bike'}</button>
          <button className="button button--danger" onClick={() => void handleDelete()} type="button">Delete Bike</button>
        </form>
      </section>
    </div>
  )
}
