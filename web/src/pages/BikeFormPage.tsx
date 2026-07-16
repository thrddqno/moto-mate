import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '../components/routing/BackButton'
import { useBikeStore } from '../stores/bikeStore'
import type { Motorcycle } from '../types'

interface BikeFormState {
  name: string
  make: string
  model: string
  year: string
  currentMileage: string
  licensePlate: string
  vin: string
  notes: string
}

const initialState: BikeFormState = {
  name: '',
  make: '',
  model: '',
  year: '',
  currentMileage: '',
  licensePlate: '',
  vin: '',
  notes: '',
}

function toFormState(bike: Motorcycle): BikeFormState {
  return {
    name: bike.name,
    make: bike.make,
    model: bike.model,
    year: bike.year?.toString() || '',
    currentMileage: bike.currentMileage.toString(),
    licensePlate: bike.licensePlate || '',
    vin: bike.vin || '',
    notes: bike.notes || '',
  }
}

export default function BikeFormPage() {
  const { bikeId } = useParams()
  const navigate = useNavigate()
  const { bikes, createBike, fetchBikes, updateBike } = useBikeStore()
  const [form, setForm] = useState<BikeFormState>(initialState)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const isEditing = Boolean(bikeId)
  const selectedBike = bikeId ? bikes.find((item) => item.id === bikeId) : null
  const currentForm = selectedBike && !dirty ? toFormState(selectedBike) : form

  useEffect(() => {
    if (bikes.length === 0) {
      void fetchBikes()
    }
  }, [bikes.length, fetchBikes])

  function updateField(field: keyof BikeFormState, value: string) {
    if (!dirty && selectedBike) {
      setForm({ ...toFormState(selectedBike), [field]: value })
      setDirty(true)
      return
    }
    setForm((current) => ({ ...current, [field]: value }))
    setDirty(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!currentForm.name.trim() || !currentForm.make.trim() || !currentForm.model.trim() || !currentForm.currentMileage.trim()) {
      setError('Name, make, model, and mileage are required.')
      return
    }

    const mileage = Number(currentForm.currentMileage)
    const year = currentForm.year ? Number(currentForm.year) : undefined
    if (!Number.isFinite(mileage) || mileage < 0) {
      setError('Mileage must be a positive number.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: currentForm.name.trim(),
        make: currentForm.make.trim(),
        model: currentForm.model.trim(),
        year,
        currentMileage: mileage,
        licensePlate: currentForm.licensePlate.trim() || undefined,
        vin: currentForm.vin.trim() || undefined,
        notes: currentForm.notes.trim() || undefined,
      }

      const saved = bikeId ? await updateBike(bikeId, payload) : await createBike(payload)
      if (saved) {
        navigate(`/bikes/${saved.id}`, { replace: true })
      } else {
        setError('Failed to save bike.')
      }
    } catch {
      setError('Failed to save bike. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <header className="top-bar">
        {isEditing ? <BackButton fallback={bikeId ? `/bikes/${bikeId}` : '/bikes'} label="Back to bike" /> : null}
        <div>
          <p className="eyebrow">Garage</p>
          <h1 className="page-title">{isEditing ? 'EDIT BIKE' : 'ADD BIKE'}</h1>
        </div>
        <Link className="icon-button" to={bikeId ? `/bikes/${bikeId}` : '/bikes'} aria-label="Cancel">
          ×
        </Link>
      </header>

      <form className="form-stack card form-card" onSubmit={handleSubmit}>
        <label>
          <span>Bike Name</span>
          <input value={currentForm.name} onChange={(event) => updateField('name', event.target.value)} placeholder="CB650R" />
        </label>
        <div className="form-grid">
          <label>
            <span>Make</span>
            <input value={currentForm.make} onChange={(event) => updateField('make', event.target.value)} placeholder="Honda" />
          </label>
          <label>
            <span>Model</span>
            <input value={currentForm.model} onChange={(event) => updateField('model', event.target.value)} placeholder="CB650R" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            <span>Year</span>
            <input inputMode="numeric" value={currentForm.year} onChange={(event) => updateField('year', event.target.value)} placeholder="2024" />
          </label>
          <label>
            <span>Mileage</span>
            <input inputMode="numeric" value={currentForm.currentMileage} onChange={(event) => updateField('currentMileage', event.target.value)} placeholder="0" />
          </label>
        </div>
        <label>
          <span>Plate</span>
          <input value={currentForm.licensePlate} onChange={(event) => updateField('licensePlate', event.target.value)} placeholder="Optional" />
        </label>
        <label>
          <span>VIN</span>
          <input value={currentForm.vin} onChange={(event) => updateField('vin', event.target.value)} placeholder="Optional" />
        </label>
        <label>
          <span>Notes</span>
          <textarea value={currentForm.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Setup notes, tire size, oil preference..." />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button" disabled={saving} type="submit">
          {saving ? 'Saving...' : 'Save Bike'}
        </button>
      </form>
    </main>
  )
}
