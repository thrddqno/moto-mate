import { useEffect, useState, type FormEvent } from 'react'
import { useScheduleStore } from '../../stores/scheduleStore'
import { useServiceLogStore } from '../../stores/serviceLogStore'

interface LogServiceModalProps {
  bikeId: string | null
  open: boolean
  onClose: () => void
  initialScheduleId?: string
}

export function LogServiceModal({ bikeId, open, onClose, initialScheduleId }: LogServiceModalProps) {
  const { fetchSchedules, scheduleMap } = useScheduleStore()
  const { createLog } = useServiceLogStore()
  const schedules = bikeId ? scheduleMap[bikeId] || [] : []
  const [scheduleId, setScheduleId] = useState(initialScheduleId || '')
  const [dateOfService, setDateOfService] = useState(new Date().toISOString().slice(0, 10))
  const [mileageAtService, setMileageAtService] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && bikeId) void fetchSchedules(bikeId)
  }, [bikeId, fetchSchedules, open])

  function closeAndReset() {
    setScheduleId('')
    setDateOfService(new Date().toISOString().slice(0, 10))
    setMileageAtService('')
    setNotes('')
    setError(null)
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!bikeId) return
    if (!scheduleId) {
      setError('Select a maintenance task.')
      return
    }
    const mileage = Number(mileageAtService)
    if (!Number.isFinite(mileage) || mileage < 0) {
      setError('Enter a valid mileage.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await createLog(bikeId, {
        scheduleId,
        dateOfService,
        mileageAtService: mileage,
        notes: notes.trim() || undefined,
      })
      closeAndReset()
    } catch {
      setError('Failed to log service.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="sheet-backdrop" role="presentation" onClick={closeAndReset}>
      <section className="action-sheet card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={closeAndReset} type="button" aria-label="Close">×</button>
        <p className="eyebrow">Maintenance</p>
        <h2 className="sheet-title">Log Service</h2>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>Task</span>
            <select value={scheduleId} onChange={(event) => setScheduleId(event.target.value)}>
              <option value="">Select task</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>{schedule.templateName}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Date</span>
            <input type="date" value={dateOfService} onChange={(event) => setDateOfService(event.target.value)} />
          </label>
          <label>
            <span>Mileage</span>
            <input inputMode="numeric" value={mileageAtService} onChange={(event) => setMileageAtService(event.target.value)} placeholder="0" />
          </label>
          <label>
            <span>Notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What was done?" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Log Service'}</button>
        </form>
      </section>
    </div>
  )
}
